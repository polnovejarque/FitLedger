import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const Terminos = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-16">

                {/* Header */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al inicio
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                        <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">Términos de Servicio</h1>
                        <p className="text-zinc-500 text-sm mt-1">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Aceptación de los Términos</h2>
                        <p>Al acceder y utilizar la plataforma FitLeader (<strong>fitleader.app</strong>), aceptas quedar vinculado por estos Términos de Servicio y nuestra <a href="/privacidad" className="text-emerald-400 hover:underline">Política de Privacidad</a>. Si no estás de acuerdo con alguno de los términos, te rogamos que no utilices el servicio.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Descripción del Servicio</h2>
                        <p>FitLeader es una plataforma SaaS (Software as a Service) diseñada para entrenadores personales y coaches fitness. El servicio permite gestionar clientes, crear rutinas de entrenamiento, controlar pagos y proporcionar una aplicación móvil personalizada a los atletas.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Cuenta de Usuario</h2>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Debes tener al menos 18 años para crear una cuenta.</li>
                            <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                            <li>Debes proporcionar información veraz y actualizada.</li>
                            <li>Notificarás inmediatamente cualquier uso no autorizado de tu cuenta.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Período de Prueba y Facturación</h2>
                        <p>FitLeader ofrece un período de prueba gratuito de <strong>14 días</strong> con acceso completo a todas las funcionalidades, sin necesidad de tarjeta de crédito. Al finalizar el período de prueba, podrás elegir continuar con una suscripción de pago. La suscripción se renueva automáticamente cada mes hasta su cancelación. Puedes cancelar en cualquier momento desde tu panel de configuración, sin penalizaciones.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Responsabilidades del Usuario</h2>
                        <p>Como usuario de FitLeader que gestiona datos de terceros (tus clientes), asumes la responsabilidad de:</p>
                        <ul className="list-disc list-inside space-y-2 mt-3 ml-2">
                            <li>Obtener el consentimiento necesario de tus clientes para tratar sus datos personales.</li>
                            <li>Cumplir con la normativa de protección de datos aplicable (RGPD) en tu relación con tus propios clientes.</li>
                            <li>No introducir datos falsos, ilícitos o que vulneren derechos de terceros.</li>
                            <li>No utilizar el servicio para actividades ilegales o fraudulentas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Propiedad Intelectual</h2>
                        <p>Todo el contenido, diseño, código y marca de FitLeader son propiedad exclusiva de FitLeader. El usuario recibe una licencia de uso limitada, no exclusiva e intransferible para acceder al servicio. Queda prohibida la reproducción, distribución o modificación sin autorización expresa.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. Limitación de Responsabilidad</h2>
                        <p>FitLeader se proporciona "tal cual". No garantizamos una disponibilidad ininterrumpida del servicio, aunque nos comprometemos a mantener una disponibilidad superior al 99% mensual. En ningún caso seremos responsables de daños indirectos, pérdida de beneficios o pérdida de datos derivados del uso o imposibilidad de uso del servicio.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. Modificaciones del Servicio</h2>
                        <p>Nos reservamos el derecho de modificar, suspender o discontinuar el servicio con un preaviso de al menos <strong>30 días</strong>. Los cambios en los precios serán notificados con al menos <strong>30 días de antelación</strong>, permitiéndote cancelar si no estás de acuerdo.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">9. Cancelación y Baja</h2>
                        <p>Puedes cancelar tu suscripción en cualquier momento desde Configuración → Plan. Al cancelar, conservarás el acceso hasta el final del período facturado. Tras la cancelación, tus datos se conservarán durante 30 días para que puedas exportarlos, pasado ese plazo serán eliminados de forma segura.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">10. Ley Aplicable y Jurisdicción</h2>
                        <p>Estos Términos se rigen por la legislación española. Para cualquier controversia derivada del uso del servicio, las partes se someten a la jurisdicción de los Juzgados y Tribunales de España, sin perjuicio de los derechos que la normativa de consumo otorga a los usuarios.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">11. Contacto</h2>
                        <p>Para cualquier consulta sobre estos Términos, puedes contactarnos en: <a href="mailto:fitleader@fitleaderapp.com" className="text-emerald-400 hover:underline">fitleader@fitleaderapp.com</a></p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Terminos;
