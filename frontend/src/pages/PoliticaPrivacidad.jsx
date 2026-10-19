import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PoliticaPrivacidad() {
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
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>Política de Privacidad</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, marginBottom: 56 }}>Última actualización: octubre de 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          <Section title="1. Responsable del tratamiento">
            <p>De conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se informa:</p>
            <ul>
              <li><strong>Responsable:</strong> ExRooms (en lo relativo a los datos de los directores/representantes de los centros que contratan el servicio)</li>
              <li><strong>Encargado del Tratamiento:</strong> ExRooms actúa como Encargado del Tratamiento respecto a los datos de alumnos y profesores gestionados por cada centro educativo</li>
              <li><strong>Contacto DPD / privacidad:</strong> privacidad@exrooms.app</li>
            </ul>
            <p>Cada centro educativo es el <strong>Responsable del Tratamiento</strong> de los datos de sus alumnos y personal docente, y debe cumplir con sus propias obligaciones en materia de protección de datos.</p>
          </Section>

          <Section title="2. Datos personales tratados">
            <p><strong>Datos de directores y representantes de centros:</strong></p>
            <ul>
              <li>Nombre, apellidos y correo electrónico</li>
              <li>Datos del centro educativo (nombre, ciudad)</li>
              <li>Datos de facturación y pago (gestionados por Stripe; ExRooms no almacena datos de tarjetas)</li>
              <li>Dirección IP y datos de acceso a la plataforma</li>
            </ul>
            <p><strong>Datos de profesores (gestionados por el centro educativo):</strong></p>
            <ul>
              <li>Nombre, apellidos, correo electrónico y asignatura</li>
              <li>Registros de actividad en la plataforma (reservas, guardias, mensajes)</li>
            </ul>
            <p><strong>Datos de alumnos (gestionados por el centro educativo):</strong></p>
            <ul>
              <li>Nombre, apellidos, grupo y curso</li>
              <li>Registros de asistencia y comportamiento introducidos por el centro</li>
            </ul>
          </Section>

          <Section title="3. Finalidad y base jurídica del tratamiento">
            <table>
              <thead>
                <tr>
                  <th>Finalidad</th>
                  <th>Base jurídica</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Prestación del servicio contratado</td><td>Ejecución del contrato (Art. 6.1.b RGPD)</td></tr>
                <tr><td>Gestión de pagos y facturación</td><td>Cumplimiento de obligación legal (Art. 6.1.c RGPD)</td></tr>
                <tr><td>Comunicaciones sobre el servicio</td><td>Interés legítimo (Art. 6.1.f RGPD)</td></tr>
                <tr><td>Mejora de la plataforma y análisis de uso</td><td>Interés legítimo (Art. 6.1.f RGPD)</td></tr>
                <tr><td>Gestión de alumnos y profesores por el centro</td><td>Misión de interés público / obligación legal del centro (Art. 6.1.e-c RGPD)</td></tr>
              </tbody>
            </table>
          </Section>

          <Section title="4. Plazo de conservación de los datos">
            <ul>
              <li><strong>Datos de la cuenta:</strong> durante la vigencia del contrato y, posteriormente, los plazos legales exigibles (hasta 5 años para datos de facturación).</li>
              <li><strong>Datos de alumnos y profesores:</strong> el tiempo necesario para la prestación del servicio. El centro educativo es responsable de definir los plazos de conservación conforme a la normativa aplicable.</li>
              <li><strong>Logs de acceso:</strong> máximo 12 meses.</li>
            </ul>
          </Section>

          <Section title="5. Destinatarios y transferencias internacionales">
            <p>Los datos pueden ser comunicados a los siguientes encargados de tratamiento:</p>
            <ul>
              <li><strong>Stripe, Inc.</strong> — procesamiento de pagos (con garantías adecuadas, Cláusulas Contractuales Tipo de la UE)</li>
              <li><strong>Resend / proveedores de email transaccional</strong> — envío de correos electrónicos de servicio</li>
              <li><strong>Proveedores de infraestructura cloud</strong> — servidores alojados en la Unión Europea</li>
            </ul>
            <p>No se realizan transferencias internacionales fuera del Espacio Económico Europeo salvo las indicadas, con las garantías adecuadas establecidas en el RGPD.</p>
          </Section>

          <Section title="6. Derechos de los interesados">
            <p>Los usuarios tienen derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> conocer qué datos personales se tratan.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de sus datos cuando ya no sean necesarios.</li>
              <li><strong>Limitación:</strong> solicitar la restricción del tratamiento en determinados casos.</li>
              <li><strong>Portabilidad:</strong> recibir sus datos en un formato estructurado y de uso común.</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento basado en interés legítimo.</li>
            </ul>
            <p>Para ejercer estos derechos, envíe un correo a <strong>privacidad@exrooms.app</strong>. Tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" style={{ color: '#34d399' }} target="_blank" rel="noopener noreferrer">www.aepd.es</a>.</p>
          </Section>

          <Section title="7. Seguridad de los datos">
            <p>ExRooms implementa medidas técnicas y organizativas apropiadas para proteger los datos personales frente a accesos no autorizados, pérdida, destrucción o alteración:</p>
            <ul>
              <li>Cifrado de comunicaciones mediante HTTPS/TLS</li>
              <li>Aislamiento de datos por centro educativo (cada centro solo accede a sus propios datos)</li>
              <li>Autenticación mediante tokens JWT con caducidad</li>
              <li>Contraseñas almacenadas con hash bcrypt</li>
              <li>Copias de seguridad periódicas</li>
              <li>Acceso restringido a los datos según rol del usuario</li>
            </ul>
          </Section>

          <Section title="8. Datos de menores">
            <p>ExRooms no permite el acceso directo de menores de 18 años a la Plataforma. Los datos de alumnos menores de edad que gestionen los centros educativos a través de ExRooms se tratan bajo la responsabilidad exclusiva del centro, que debe:</p>
            <ul>
              <li>Contar con la base jurídica adecuada para su tratamiento (misión de interés público o consentimiento de los titulares de la patria potestad)</li>
              <li>Informar a los padres/tutores sobre el tratamiento de datos</li>
              <li>Cumplir con el principio de minimización de datos</li>
            </ul>
          </Section>

          <Section title="9. Cookies">
            <p>ExRooms utiliza únicamente cookies técnicas estrictamente necesarias para el funcionamiento de la Plataforma (autenticación de sesión). No se utilizan cookies de seguimiento, publicidad ni análisis de terceros.</p>
          </Section>

          <Section title="10. Modificaciones de la política">
            <p>ExRooms puede actualizar esta Política de Privacidad para adaptarla a cambios normativos o en el servicio. Cualquier cambio significativo será notificado a los usuarios registrados por correo electrónico con al menos 30 días de antelación.</p>
          </Section>

        </div>

        <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link to="/aviso-legal" style={{ color: '#34d399', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Aviso Legal →</Link>
          <Link to="/bienvenida" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', fontSize: 14 }}>Volver al inicio</Link>
        </div>
      </div>

      <style>{`
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 10px 14px; border: 1px solid rgba(255,255,255,.1); font-size: 14px; }
        th { background: rgba(52,211,153,.08); color: #34d399; font-weight: 700; }
        td { color: rgba(255,255,255,.6); }
        ul { padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
        li { color: rgba(255,255,255,.6); }
        a { color: #34d399; }
      `}</style>
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
