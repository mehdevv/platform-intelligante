import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/** Keeps <html lang> in sync with active locale. */
export default function I18nHtmlLang() {
    const { i18n } = useTranslation()
    useEffect(() => {
        const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en'
        document.documentElement.lang = lang
        document.documentElement.setAttribute('data-lang', lang)
    }, [i18n.language])
    return null
}
