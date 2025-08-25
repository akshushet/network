// NoFocusZoom.jsx
import { useEffect } from 'react'

export default function NoFocusZoom() {
    useEffect(() => {
        // Ensure viewport meta exists and is reasonable
        const content = 'width=device-width, initial-scale=1, viewport-fit=cover'
        let tag = document.querySelector('meta[name="viewport"]')
        if (tag) tag.setAttribute('content', content)
        else {
            tag = document.createElement('meta')
            tag.name = 'viewport'
            tag.content = content
            document.head.appendChild(tag)
        }
    }, [])

    return (
        <style>{`
      html { -webkit-text-size-adjust: 100%; }
      /* The key line: keep focused controls >= 16px to prevent iOS focus zoom */
      input, textarea, select, button { font-size: 16px !important; }
      /* Nice to have for touch targets */
      input, textarea, select, button { min-height: 44px; line-height: 1.25; }
    `}</style>
    )
}
