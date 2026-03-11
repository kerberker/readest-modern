import { useState, useCallback, useEffect } from 'react'
import { getSetting, setSetting, getAllSettings } from '../lib/tauri'

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const all = await getAllSettings()
      const map: Record<string, string> = {}
      all.forEach((s) => {
        map[s.key] = s.value
      })
      setSettings(map)
      setLoaded(true)
    } catch {
      setLoaded(true)
    }
  }, [])

  const updateSetting = useCallback(async (key: string, value: string) => {
    try {
      await setSetting(key, value)
      setSettings((prev) => ({ ...prev, [key]: value }))
    } catch {
      // ignore
    }
  }, [])

  const getSingleSetting = useCallback(
    (key: string, defaultValue: string = ''): string => {
      return settings[key] ?? defaultValue
    },
    [settings],
  )

  return { settings, loaded, fetchSettings, updateSetting, getSingleSetting }
}
