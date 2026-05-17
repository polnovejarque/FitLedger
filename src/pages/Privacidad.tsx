import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacidad = () => {
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
                        <Shield className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">Política de Privacidad</h1>
                        <p className="text-zinc-500 text-sm mt-1">Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none space-y-8 text-zinc-300 leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Responsable del Tratamiento</h2>
                        <p>FitLeader (en adelante, "nosotros", "la empresa") es responsable del tratamiento de los datos personales que nos facilites a través de nuestra plataforma, accesible en <strong>fitleader.app</strong>.</p>
                        <p className="mt-2">Para cualquier consulta relacionada con esta política, puedes contactarnos en: <a href="mailto:fitleader@fitleaderapp.com" className="text-emerald-400 hover:underline">fitleader@fitleaderapp.com</a></p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Datos que Recopilamos</h2>
                        <p>Recopilamos únicamente los datos necesarios para prestarte el servicio:</p>
                        <ul className="list-disc list-inside space-y-2 mt-3 ml-2">
                            <li><strong>Datos de cuenta:</strong> dirección de correo electrónico y contraseña (cifrada).</li>
                            <li><strong>Datos del negocio:</strong> nombre de tu empresa o marca personal, logo.</li>
                            <li><strong>Datos de clientes:</strong> la información que tú introduzcas sobre tus propios clientes (nombre, objetivos, historial de entrenamientos, medidas). Tú eres el responsable de estos datos ante tus clientes.</li>
                            <li><strong>Datos de uso:</strong> métricas anónimas de navegación a través de Plausible Analytics (sin cookies, sin identificadores personales).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Finalidad y Base Legal del Tratamiento</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-zinc-800 rounded-xl overflow-hidden">
                                <thead>
                                    <tr className="bg-zinc-900">
                                        <th className="text-left p-4 text-white font-semibold border-b border-zinc-800">Finalidad</th>
                                        <th className="text-left p-4 text-white font-semibold border-b border-zinc-800">Base Legal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    <tr className="bg-zinc-950">
                                        <td className="p-4">Prestación del servicio de gestión de entrenadores</td>
                                        <td className="p-4">Ejecución del contrato (Art. 6.1.b RGPD)</td>
                                    </tr>
                                    <tr className="bg-zinc-900/50">
                                        <td className="p-4">Comunicaciones sobre el servicio (facturas, avisos)</td>
                                        <td className="p-4">Interés legítimo (Art. 6.1.f RGPD)</td>
                                    </tr>
                                    <tr className="bg-zinc-950">
                                        <td className="p-4">Análisis de uso anónimo de la plataforma</td>
                                        <td className="p-4">Interés legítimo — datos anónimos, sin cookies</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Almacenamiento y Seguridad</h2>
                        <p>Todos los datos se almacenan cifrados en servidores ubicados en la <strong>Unión Europea</strong>, cumpliendo con los más altos estándares de seguridad. Utilizamos cifrado en tránsito (TLS) y en reposo para proteger tu información.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Compartición de Datos con Terceros</h2>
                        <p>No vendemos ni cedemos tus datos a terceros. Únicamente compartimos información con proveedores de servicio esenciales que actúan como encargados del tratamiento bajo acuerdos de confidencialidad, para poder operar la plataforma (procesamiento de pagos, infraestructura cloud).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">6. Tus Derechos (RGPD)</h2>
                        <p>Como usuario, tienes derecho a:</p>
                        <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
                            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre ti.</li>
                            <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
                            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos ("derecho al olvido").</li>
                            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
                            <li><strong>Oposición:</strong> oponerte a determinados tratamientos.</li>
                            <li><strong>Limitación:</strong> restringir el tratamiento en determinadas circunstancias.</li>
                        </ul>
                        <p className="mt-4">Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:fitleader@fitleaderapp.com" className="text-emerald-400 hover:underline">fitleader@fitleaderapp.com</a>. Responderemos en un plazo máximo de 30 días. También puedes presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Agencia Española de Protección de Datos (AEPD)</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">7. Cookies y Analítica</h2>
                        <p>FitLeader utiliza <strong>Plausible Analytics</strong> para el análisis de tráfico. Plausible no utiliza cookies y no recopila datos personales identificables, por lo que <strong>no es necesario un banner de consentimiento de cookies</strong>. Puedes consultar la política de privacidad de Plausible en <a href="https://plausible.io/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">plausible.io/privacy</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">8. Modificaciones</h2>
                        <p>Nos reservamos el derecho a actualizar esta política. Cualquier cambio significativo se comunicará por correo electrónico o mediante un aviso visible en la plataforma con al menos 15 días de antelación.</p>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Privacidad;
