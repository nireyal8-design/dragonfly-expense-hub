import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log incoming request
    console.log('Incoming request:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Check environment variables
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Log environment variable status (without revealing values)
    console.log('Environment variables status:', {
      SENDGRID_API_KEY: !!SENDGRID_API_KEY,
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY
    });

    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (e) {
      throw new Error(`Invalid request body: ${e.message}`);
    }

    const { userId, expenseId } = body;
    if (!userId || !expenseId) {
      throw new Error(`Missing required parameters: ${!userId ? 'userId' : 'expenseId'}`);
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user data
    console.log('Fetching user data for ID:', userId);
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('User fetch error:', userError);
      throw userError;
    }
    if (!user) {
      throw new Error('User not found');
    }
    console.log('Found user:', { email: user.email });

    // Get expense data
    console.log('Fetching expense data for ID:', expenseId);
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (expenseError) {
      console.error('Expense fetch error:', expenseError);
      throw expenseError;
    }
    if (!expense) {
      throw new Error('Expense not found');
    }
    console.log('Found expense:', expense);

    // Get notification settings
    console.log('Fetching notification settings for user:', userId);
    const { data: notificationSettings } = await supabase
      .from('notification_settings')
      .select('email_notifications, notification_type')
      .eq('user_id', userId)
      .single();

    if (!notificationSettings) {
      throw new Error('Notification settings not found');
    }
    console.log('Found notification settings:', notificationSettings);

    // Check if notifications are enabled and the type matches
    if (notificationSettings.email_notifications) {
      const shouldSend = notificationSettings.notification_type === 'all' || 
                        notificationSettings.notification_type === 'new_expense' ||
                        (notificationSettings.notification_type === 'budget_over' && 
                         await checkBudgetOverage(supabase, userId, expense));

      if (shouldSend) {
        // Create email HTML with improved formatting
        const emailHtml = `
          <!DOCTYPE html>
          <html dir="rtl" lang="he">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <title>SpendWise Expense Notification</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
              }
              .header {
                background-color: #1a5f7a;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                padding: 20px;
                background-color: #ffffff;
              }
              .expense-details {
                margin: 20px 0;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
              }
              .footer {
                margin-top: 20px;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6c757d;
                border-top: 1px solid #e9ecef;
              }
              .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #1a5f7a;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 15px;
              }
              .amount {
                font-size: 24px;
                font-weight: bold;
                color: #1a5f7a;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <div style="position: relative; width: 28px; height: 28px;">
                    <!-- Wallet Icon -->
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 7v12a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                    <!-- Trending Up Icon -->
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: -8px; right: -8px;">
                      <path d="m23 6-9.5 9.5-5-5L1 18" />
                      <path d="M17 6h6v6" />
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: white;">SpendWise - עדכון הוצאות</h1>
                </div>
              </div>
              <div class="content">
                <h2>שלום ${user.user_metadata?.first_name || ''},</h2>
                <p>נוספה הוצאה חדשה לחשבונך:</p>
                
                <div class="expense-details">
                  <p><strong>שם ההוצאה:</strong> ${expense.name}</p>
                  <div class="amount">₪${expense.amount.toLocaleString()}</div>
                  <p><strong>קטגוריה:</strong> ${expense.category || 'לא צוין'}</p>
                  <p><strong>תאריך:</strong> ${new Date(expense.date).toLocaleDateString('he-IL')}</p>
                </div>

                <a href="${SUPABASE_URL}/dashboard" class="button">צפה בהוצאות שלך</a>
              </div>
              
              <div class="footer">
                <p>
                  הודעת דוא"ל זו נשלחה מ-SpendWise.<br>
                  כתובת: רחוב הברזל 3, תל אביב, ישראל
                </p>
                <p>
                  © ${new Date().getFullYear()} SpendWise. כל הזכויות שמורות.
                </p>
                <p>
                  אם אינך רוצה לקבל הודעות אלו, תוכל לשנות את העדפות ההתראות שלך 
                  <a href="${SUPABASE_URL}/settings">בהגדרות החשבון</a>.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send email using SendGrid with improved headers
        console.log('Sending email to:', user.email);
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ 
                email: user.email,
                name: `${user.user_metadata?.first_name} ${user.user_metadata?.last_name}`.trim() || user.email
              }]
            }],
            from: {
              email: 'dragonflycustomercontact@gmail.com',
              name: 'SpendWise'
            },
            reply_to: {
              email: 'dragonflycustomercontact@gmail.com',
              name: 'SpendWise Support'
            },
            subject: `הוצאה חדשה: ${expense.name} - ₪${expense.amount.toLocaleString()}`,
            content: [{
              type: 'text/html',
              value: emailHtml
            }],
            mail_settings: {
              bypass_list_management: {
                enable: true
              }
            }
          }),
        });

        // Log SendGrid response
        const responseText = await sendGridResponse.text();
        console.log('SendGrid Response:', {
          status: sendGridResponse.status,
          statusText: sendGridResponse.statusText,
          body: responseText
        });

        if (!sendGridResponse.ok) {
          throw new Error(`SendGrid error: ${responseText}`);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Email sent successfully' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification settings not met' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

// Helper function to check budget overage
async function checkBudgetOverage(supabase, userId, expense) {
  const { data: budget } = await supabase
    .from('users')
    .select('budget')
    .eq('id', userId)
    .single();

  if (!budget?.budget) return false;

  // Get total expenses for the current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyExpenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', startOfMonth.toISOString())
    .lte('date', new Date().toISOString());

  const totalExpenses = monthlyExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  return totalExpenses > budget.budget;
} 