import { useState } from 'react'
import { Settings, Save, RotateCcw, Leaf } from 'lucide-react'
import Card from '../components/common/Card'
import { useSystem } from '../context/SystemContext'

const PLANT_OPTIONS = [
  { value: 'tomato', label: 'Domates' },
  { value: 'pepper', label: 'Biber' },
  { value: 'cucumber', label: 'Salatalık' },
  { value: 'eggplant', label: 'Patlıcan' },
  { value: 'lettuce', label: 'Marul' },
  { value: 'strawberry', label: 'Çilek' },
  { value: 'grass', label: 'Çim' },
  { value: 'other', label: 'Diğer' },
]

/**
 * SettingsPage - System configuration panel with plant type,
 * notification preferences, and timing settings.
 * // TODO: Replace updateSettings with API call to PUT /api/settings
 */
export default function SettingsPage() {
  const { settings, updateSettings } = useSystem()
  const [localSettings, setLocalSettings] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    // TODO: Replace with API call to PUT /api/settings
    updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setLocalSettings({ ...settings })
    setSaved(false)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plant Type */}
        <Card>
          <h3 className="text-sm font-medium text-gray-800 mb-5">Plant Type</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4 text-green-500" />
              <label className="text-sm text-gray-600">Select the plant being irrigated</label>
            </div>
            <select
              value={localSettings.plantType}
              onChange={(e) => handleChange('plantType', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all cursor-pointer"
            >
              {PLANT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">
              Used by the AI decision algorithm to optimize irrigation.
            </p>
          </div>
        </Card>

        {/* Timing Settings */}
        <Card>
          <h3 className="text-sm font-medium text-gray-800 mb-5">Timing Settings</h3>

          <div className="space-y-6">
            {/* Deep sleep interval */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-600">Deep Sleep Interval</label>
                <span className="text-sm font-semibold text-indigo-600">{localSettings.deepSleepInterval} min</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={localSettings.deepSleepInterval}
                onChange={(e) => handleChange('deepSleepInterval', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 min</span>
                <span>60 min</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                How often ESP32 wakes from deep sleep to check sensors.
              </p>
            </div>

            {/* Max pump runtime */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-600">Max Pump Runtime</label>
                <span className="text-sm font-semibold text-red-600">{localSettings.maxPumpRuntime} min</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={localSettings.maxPumpRuntime}
                onChange={(e) => handleChange('maxPumpRuntime', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 min</span>
                <span>60 min</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Safety limit: pump will automatically shut off after this duration.
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-800 mb-5">Notification Preferences</h3>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Push notifications toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  localSettings.pushNotifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => handleChange('pushNotifications', !localSettings.pushNotifications)}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    localSettings.pushNotifications ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                <p className="text-xs text-gray-400">Receive browser push notifications</p>
              </div>
            </label>

          </div>
        </Card>
      </div>

      {/* Save / Reset buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all active:scale-95 ${
            saved
              ? 'bg-green-500 shadow-lg shadow-green-200'
              : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  )
}
