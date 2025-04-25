  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium">הגדרות תזכורות</h3>
      <p className="text-sm text-muted-foreground">
        הגדר את העדפות התזכורות שלך
      </p>
    </div>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>התראות במערכת</Label>
          <p className="text-sm text-muted-foreground">
            קבל התראות במערכת על הוצאות מתקרבות
          </p>
        </div>
        <Switch
          checked={settings.systemNotifications}
          onCheckedChange={(checked) => updateSettings({ systemNotifications: checked })}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>התראות במייל</Label>
          <p className="text-sm text-muted-foreground">
            קבל התראות במייל על הוצאות מתקרבות
          </p>
        </div>
        <Switch
          checked={settings.emailNotifications}
          onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
        />
      </div>
      <div className="space-y-2">
        <Label>ימים מראש לתזכורת</Label>
        <Input
          type="number"
          min="0"
          value={settings.reminderDaysBefore}
          onChange={(e) => updateSettings({ reminderDaysBefore: parseInt(e.target.value) })}
        />
        <p className="text-sm text-muted-foreground">
          מספר הימים לפני ההוצאה לקבלת תזכורת
        </p>
      </div>
    </div>
  </div> 