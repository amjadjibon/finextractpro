"use client"

import { useState, useEffect } from "react"
import { settingsAPI } from "@/lib/api"
import { 
  DEFAULT_SETTINGS,
  getSettingDisplayName,
  getSettingDescription,
  type SettingCategory,
  type UserSettings
} from "@/lib/types/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  Bell,
  Shield,
  Database,
  Key,
  Mail,
  Phone,
  Camera,
  Save,
  Trash2,
  Download,
  Upload,
  Link as LinkIcon,
  Smartphone,
  Globe,
  Clock,
  Settings as SettingsIcon,
  Zap,
  AlertTriangle,
  Plus,
  CheckCircle,
  Brain,
  Eye,
  Palette,
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await settingsAPI.list({ grouped: true })
      if (response.settings && Object.keys(response.settings).length > 0) {
        setSettings(response.settings as UserSettings)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (category: SettingCategory) => {
    try {
      setSaving(true)
      setError(null)
      setSuccessMessage(null)

      // Convert category settings to array format for bulk update
      const categorySettings = Object.entries(settings[category]).map(([key, value]) => ({
        category,
        key,
        value
      }))

      await settingsAPI.bulkUpdate(categorySettings)
      setSuccessMessage(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: SettingCategory, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Loading your settings...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
        
        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={settings.profile.display_name}
                    onChange={(e) => updateSetting('profile', 'display_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={settings.profile.bio || ''}
                    onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.profile.timezone} 
                    onValueChange={(value) => updateSetting('profile', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="US/Eastern">Eastern Time</SelectItem>
                      <SelectItem value="US/Central">Central Time</SelectItem>
                      <SelectItem value="US/Mountain">Mountain Time</SelectItem>
                      <SelectItem value="US/Pacific">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                      <SelectItem value="Europe/Paris">CET</SelectItem>
                      <SelectItem value="Asia/Tokyo">JST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.profile.language} 
                    onValueChange={(value) => updateSetting('profile', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.profile.email_notifications}
                  onCheckedChange={(checked) => updateSetting('profile', 'email_notifications', checked)}
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings('profile')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Processing Complete</Label>
                    <p className="text-sm text-gray-500">When document processing is finished</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email_processing_complete}
                    onCheckedChange={(checked) => updateSetting('notifications', 'email_processing_complete', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Processing Failed</Label>
                    <p className="text-sm text-gray-500">When errors occur during processing</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email_processing_failed}
                    onCheckedChange={(checked) => updateSetting('notifications', 'email_processing_failed', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Summary</Label>
                    <p className="text-sm text-gray-500">Summary of your weekly activity</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email_weekly_summary}
                    onCheckedChange={(checked) => updateSetting('notifications', 'email_weekly_summary', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push_notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', 'push_notifications', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification_frequency">Notification Frequency</Label>
                  <Select 
                    value={settings.notifications.notification_frequency} 
                    onValueChange={(value) => updateSetting('notifications', 'notification_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('notifications')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Notifications'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Processing Settings</CardTitle>
              <CardDescription>Configure AI behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferred_provider">Preferred AI Provider</Label>
                  <Select 
                    value={settings.ai.preferred_provider} 
                    onValueChange={(value) => updateSetting('ai', 'preferred_provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                      <SelectItem value="groq">Groq</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_model">Preferred Model</Label>
                  <Input
                    id="preferred_model"
                    value={settings.ai.preferred_model || ''}
                    onChange={(e) => updateSetting('ai', 'preferred_model', e.target.value)}
                    placeholder="Leave empty for default model"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence_threshold">Confidence Threshold ({settings.ai.confidence_threshold}%)</Label>
                  <input
                    type="range"
                    id="confidence_threshold"
                    min="0"
                    max="100"
                    value={settings.ai.confidence_threshold}
                    onChange={(e) => updateSetting('ai', 'confidence_threshold', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Minimum confidence score to accept AI extractions</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-process Uploads</Label>
                    <p className="text-sm text-gray-500">Automatically process documents upon upload</p>
                  </div>
                  <Switch
                    checked={settings.ai.auto_process_uploads}
                    onCheckedChange={(checked) => updateSetting('ai', 'auto_process_uploads', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Save Processing History</Label>
                    <p className="text-sm text-gray-500">Keep a history of AI processing results</p>
                  </div>
                  <Switch
                    checked={settings.ai.save_processing_history}
                    onCheckedChange={(checked) => updateSetting('ai', 'save_processing_history', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Vision Processing</Label>
                    <p className="text-sm text-gray-500">Allow AI to process image documents</p>
                  </div>
                  <Switch
                    checked={settings.ai.enable_vision_processing}
                    onCheckedChange={(checked) => updateSetting('ai', 'enable_vision_processing', checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('ai')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <Brain className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save AI Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Processing</CardTitle>
              <CardDescription>Configure document processing behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max_file_size_mb">Max File Size (MB)</Label>
                  <Input
                    id="max_file_size_mb"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.processing.max_file_size_mb}
                    onChange={(e) => updateSetting('processing', 'max_file_size_mb', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-detect Document Type</Label>
                    <p className="text-sm text-gray-500">Automatically detect the type of uploaded documents</p>
                  </div>
                  <Switch
                    checked={settings.processing.auto_detect_document_type}
                    onCheckedChange={(checked) => updateSetting('processing', 'auto_detect_document_type', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_template_id">Default Template ID</Label>
                  <Input
                    id="default_template_id"
                    value={settings.processing.default_template_id || ''}
                    onChange={(e) => updateSetting('processing', 'default_template_id', e.target.value)}
                    placeholder="Leave empty for no default"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Keep Original Files</Label>
                    <p className="text-sm text-gray-500">Store original files after processing</p>
                  </div>
                  <Switch
                    checked={settings.processing.keep_original_files}
                    onCheckedChange={(checked) => updateSetting('processing', 'keep_original_files', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="processing_timeout_minutes">Processing Timeout (minutes)</Label>
                  <Input
                    id="processing_timeout_minutes"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.processing.processing_timeout_minutes}
                    onChange={(e) => updateSetting('processing', 'processing_timeout_minutes', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Batch Processing</Label>
                    <p className="text-sm text-gray-500">Enable processing multiple documents at once</p>
                  </div>
                  <Switch
                    checked={settings.processing.batch_processing_enabled}
                    onCheckedChange={(checked) => updateSetting('processing', 'batch_processing_enabled', checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('processing')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Processing Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Tab */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize the appearance and layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={settings.display.theme} 
                    onValueChange={(value) => updateSetting('display', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="density">Layout Density</Label>
                  <Select 
                    value={settings.display.density} 
                    onValueChange={(value) => updateSetting('display', 'density', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sidebar Collapsed</Label>
                    <p className="text-sm text-gray-500">Start with sidebar collapsed</p>
                  </div>
                  <Switch
                    checked={settings.display.sidebar_collapsed}
                    onCheckedChange={(checked) => updateSetting('display', 'sidebar_collapsed', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Confidence Scores</Label>
                    <p className="text-sm text-gray-500">Display AI confidence scores in the interface</p>
                  </div>
                  <Switch
                    checked={settings.display.show_confidence_scores}
                    onCheckedChange={(checked) => updateSetting('display', 'show_confidence_scores', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select 
                    value={settings.display.date_format} 
                    onValueChange={(value) => updateSetting('display', 'date_format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number_format">Number Format</Label>
                  <Select 
                    value={settings.display.number_format} 
                    onValueChange={(value) => updateSetting('display', 'number_format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">US (1,234.56)</SelectItem>
                      <SelectItem value="EU">European (1.234,56)</SelectItem>
                      <SelectItem value="international">International (1 234.56)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('display')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <Palette className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Display Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={settings.security.two_factor_enabled}
                    onCheckedChange={(checked) => updateSetting('security', 'two_factor_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout_minutes"
                    type="number"
                    min="15"
                    max="1440"
                    value={settings.security.session_timeout_minutes}
                    onChange={(e) => updateSetting('security', 'session_timeout_minutes', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified of new logins</p>
                  </div>
                  <Switch
                    checked={settings.security.login_notifications}
                    onCheckedChange={(checked) => updateSetting('security', 'login_notifications', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_retention_days">Data Retention (days)</Label>
                  <Input
                    id="data_retention_days"
                    type="number"
                    min="30"
                    max="2555"
                    value={settings.security.data_retention_days}
                    onChange={(e) => updateSetting('security', 'data_retention_days', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">How long to keep your processed documents</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Data Export</Label>
                    <p className="text-sm text-gray-500">Allow users to export their data</p>
                  </div>
                  <Switch
                    checked={settings.security.allow_data_export}
                    onCheckedChange={(checked) => updateSetting('security', 'allow_data_export', checked)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('security')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <Shield className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure external integrations and backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    value={settings.integrations.webhook_url || ''}
                    onChange={(e) => updateSetting('integrations', 'webhook_url', e.target.value)}
                    placeholder="https://your-webhook-endpoint.com"
                  />
                  <p className="text-xs text-gray-500">URL to receive processing notifications</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>API Access</Label>
                    <p className="text-sm text-gray-500">Enable API access to your account</p>
                  </div>
                  <Switch
                    checked={settings.integrations.api_access_enabled}
                    onCheckedChange={(checked) => updateSetting('integrations', 'api_access_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Export Formats</Label>
                  <div className="flex flex-wrap gap-2">
                    {['json', 'csv', 'excel', 'pdf'].map((format) => (
                      <label key={format} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.integrations.export_formats.includes(format)}
                          onChange={(e) => {
                            const formats = [...settings.integrations.export_formats]
                            if (e.target.checked) {
                              formats.push(format)
                            } else {
                              const index = formats.indexOf(format)
                              if (index > -1) formats.splice(index, 1)
                            }
                            updateSetting('integrations', 'export_formats', formats)
                          }}
                        />
                        <span className="text-sm">{format.toUpperCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-backup</Label>
                    <p className="text-sm text-gray-500">Automatically backup your data</p>
                  </div>
                  <Switch
                    checked={settings.integrations.auto_backup_enabled}
                    onCheckedChange={(checked) => updateSetting('integrations', 'auto_backup_enabled', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup_frequency">Backup Frequency</Label>
                  <Select 
                    value={settings.integrations.backup_frequency} 
                    onValueChange={(value) => updateSetting('integrations', 'backup_frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('integrations')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Integration Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced features and experimental options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-500">Enable detailed logging and debugging features</p>
                  </div>
                  <Switch
                    checked={settings.advanced.debug_mode}
                    onCheckedChange={(checked) => updateSetting('advanced', 'debug_mode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Beta Features</Label>
                    <p className="text-sm text-gray-500">Access to experimental features</p>
                  </div>
                  <Switch
                    checked={settings.advanced.beta_features}
                    onCheckedChange={(checked) => updateSetting('advanced', 'beta_features', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Telemetry</Label>
                    <p className="text-sm text-gray-500">Help improve the service by sharing usage data</p>
                  </div>
                  <Switch
                    checked={settings.advanced.telemetry_enabled}
                    onCheckedChange={(checked) => updateSetting('advanced', 'telemetry_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cache</Label>
                    <p className="text-sm text-gray-500">Enable caching for better performance</p>
                  </div>
                  <Switch
                    checked={settings.advanced.cache_enabled}
                    onCheckedChange={(checked) => updateSetting('advanced', 'cache_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Experimental AI Models</Label>
                    <p className="text-sm text-gray-500">Access to cutting-edge AI models</p>
                  </div>
                  <Switch
                    checked={settings.advanced.experimental_ai_models}
                    onCheckedChange={(checked) => updateSetting('advanced', 'experimental_ai_models', checked)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Danger Zone</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <Button 
                onClick={() => handleSaveSettings('advanced')} 
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Advanced Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}