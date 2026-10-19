import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function AvisoLegal() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#fff' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0a0a0a', border: '1.5px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', fontFamily: 'Georgia,serif' }}>E</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Ex<span style={{ color: '#34d399' }}>Rooms</span></span>
        </div>
        <Link to="/bienvenida" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
      </nav>

      {/* Contenido */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 40px 100px' }}>

        <p style={{ color: '#34d399', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>Aviso Legal</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, marginBottom: 56 }}>Última actualización: octubre de 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <Section title="1. Datos del titular">
            <p>En cumplimiento con el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSICE), se facilitan los siguientes datos identificativos:</p>
            <ul>
              <li><strong>Denominación:</strong> ExRooms</li>
              <li><strong>Correo electrónico de contacto:</strong> soporte@exrooms.app</li>
              <li><strong>Sitio web:</strong> https://exrooms.app</li>
            </ul>
          </Section>

          <Section title="2. Objeto y ámbito de aplicación">
            <p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>exrooms.app</strong> y de la plataforma de gestión educativa ExRooms (en adelante, "la Plataforma"), puesta a disposición de centros educativos para su gestión interna.</p>
            <p>El acceso a la Plataforma implica la aceptación plena y sin reservas de las presentes condiciones. El uso de la Plataforma está exclusivamente destinado a centros educativos registrados y a sus usuarios autorizados (directores, jefes de estudios y profesores).</p>
          </Section>

          <Section title="3. Propiedad intelectual e industrial">
            <p>Todos los contenidos de la Plataforma —incluyendo textos, imágenes, diseño, código fuente, logotipos y elementos gráficos— son titularidad de ExRooms o de sus licenciantes, y están protegidos por la legislación española e internacional en materia de propiedad intelectual e industrial.</p>
            <p>Queda expresamente prohibida su reproducción, distribución, comunicación pública o transformación sin autorización previa y por escrito del titular. El usuario puede consultar y utilizar los contenidos únicamente para el uso interno de su centro educativo, dentro de los límites del servicio contratado.</p>
          </Section>

          <Section title="4. Condiciones de uso">
            <p>El usuario se compromete a:</p>
            <ul>
              <li>Hacer un uso lícito de la Plataforma, conforme a la ley, la moral y el orden público.</li>
              <li>No introducir datos falsos, inexactos o de terceros sin su consentimiento.</li>
              <li>No realizar acciones que puedan dañar, inutilizar o sobrecargar la Plataforma.</li>
              <li>No intentar acceder a datos de otros centros educativos ni vulnerar medidas de seguridad.</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
            </ul>
            <p>El incumplimiento de estas condiciones podrá dar lugar a la suspensión o cancelación del acceso a la Plataforma.</p>
          </Section>

          <Section title="5. Exclusión de responsabilidad">
            <p>ExRooms no garantiza la disponibilidad continua e ininterrumpida de la Plataforma, y no se hace responsable de los daños y perjuicios derivados de interrupciones del servicio por mantenimiento, fallos técnicos o causas ajenas a su control.</p>
            <p>ExRooms no es responsable del uso que los centros educativos o sus usuarios hagan de la Plataforma, ni del contenido introducido por los usuarios (datos de alumnos, comunicaciones internas, etc.).</p>
            <p>La responsabilidad sobre el tratamiento de datos personales de alumnos y profesores recae en el propio centro educativo, que actúa como <strong>Responsable del Tratamiento</strong> en los términos del RGPD. ExRooms actúa como <strong>Encargado del Tratamiento</strong> según el Artículo 28 del RGPD.</p>
          </Section>

          <Section title="6. Menores de edad">
            <p>La Plataforma ExRooms está destinada a su uso exclusivo por parte de <strong>mayores de 18 años</strong> (directores, jefes de estudios y profesores). No está permitido el acceso directo de menores a la Plataforma.</p>
            <p>Los datos de alumnos menores de edad que se gestionen a través de la Plataforma están bajo la exclusiva responsabilidad del centro educativo, que deberá cumplir con las obligaciones legales de consentimiento parental y protección de datos de menores establecidas en el RGPD y la LOPDGDD.</p>
          </Section>

          <Section title="7. Legislación aplicable y jurisdicción">
            <p>El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia derivada del acceso o uso de la Plataforma, las partes se someten a los Juzgados y Tribunales del domicilio del usuario, renunciando a cualquier otro fuero que pudiera corresponderles.</p>
          </Section>

          <Section title="8. Modificaciones">
            <p>ExRooms se reserva el derecho a modificar el presente Aviso Legal en cualquier momento. Las modificaciones serán notificadas a los usuarios registrados con antelación razonable. El uso continuado de la Plataforma tras la notificación implica la aceptación de las nuevas condiciones.</p>
          </Section>

        </div>

        <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link to="/privacidad" style={{ color: '#34d399', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Política de Privacidad →</Link>
          <Link to="/bienvenida" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', fontSize: 14 }}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.06)' }}>{title}</h2>
      <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}
