// Reemplaza por el número de WhatsApp de Sanddy, con indicativo de país y sin el símbolo "+".
export const WHATSAPP_NUMBER = 'NUMERO_PLACEHOLDER'

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="relative z-10 h-9 w-9 fill-current">
      <path d="M12.06 0C5.41 0 .01 5.4.01 12.05c0 2.13.56 4.21 1.61 6.04L.06 24l6.33-1.66a12.05 12.05 0 005.73 1.46h.01c6.65 0 12.05-5.4 12.05-12.05S18.7 0 12.06 0zm0 21.79h-.01a9.88 9.88 0 01-5.03-1.38l-.36-.21-3.75.98 1-3.65-.23-.37a9.88 9.88 0 01-1.52-5.26c0-5.44 4.43-9.87 9.88-9.87 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.44-4.43 9.87-9.87 9.87zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z" />
    </svg>
  )
}

/** Botón flotante que abre una conversación de WhatsApp con Sanddy. */
export function WhatsAppButton() {
  return (
    <a
      className="fixed right-5 bottom-5 z-30 grid h-[68px] w-[68px] place-items-center rounded-full bg-[#25D366] text-white no-underline shadow-lg transition hover:bg-[#1da851] focus:outline-3 focus:outline-offset-2 focus:outline-[#FF5722]"
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir conversación por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  )
}
