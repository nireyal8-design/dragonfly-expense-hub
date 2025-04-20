import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Debug: Log all environment variables
    const envVars = {
      SENDGRID_API_KEY: !!Deno.env.get('SENDGRID_API_KEY'),
      SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    };
    console.log('Environment variables:', envVars);

    // Verify required environment variables
    if (!Deno.env.get('SENDGRID_API_KEY')) {
      throw new Error('SENDGRID_API_KEY is missing');
    }
    if (!Deno.env.get('SUPABASE_URL')) {
      throw new Error('SUPABASE_URL is missing');
    }
    if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    }

    // Debug: Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (e) {
      throw new Error(`Failed to parse request body: ${e.message}`);
    }

    const { userId, subject, message } = body;
    
    // Validate request data
    if (!userId) throw new Error('userId is required');
    if (!subject) throw new Error('subject is required');
    if (!message) throw new Error('message is required');

    // Test email with minimal configuration
    try {
      const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: 'dragonflycustomercontact@gmail.com' }]
          }],
          from: {
            email: 'dragonflycustomercontact@gmail.com',
            name: 'WiseSpend Support'
          },
          subject: 'Test Support Email',
          content: [{
            type: 'text/plain',
            value: 'This is a test email'
          }]
        })
      });

      const responseText = await sendGridResponse.text();
      console.log('SendGrid test response:', {
        status: sendGridResponse.status,
        text: responseText
      });

      if (!sendGridResponse.ok) {
        throw new Error(`SendGrid error: ${sendGridResponse.status} - ${responseText}`);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (sendGridError) {
      console.error('SendGrid error:', sendGridError);
      throw new Error(`Failed to send email: ${sendGridError.message}`);
    }

  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
}); 