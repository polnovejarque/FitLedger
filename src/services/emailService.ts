import { supabase } from '../lib/supabase';

// Clave para almacenar la API Key en Local Storage de manera privada
const RESEND_KEY_STORAGE = 'fitleader_resend_api_key';

/**
 * Obtener la API Key de Resend configurada en el navegador
 */
export const getResendApiKey = (): string | null => {
    return localStorage.getItem(RESEND_KEY_STORAGE);
};

/**
 * Guardar la API Key de Resend de forma local y privada
 */
export const setResendApiKey = (key: string | null) => {
    if (key) {
        localStorage.setItem(RESEND_KEY_STORAGE, key.trim());
    } else {
        localStorage.removeItem(RESEND_KEY_STORAGE);
    }
};

/**
 * Interfaz para guardar el registro del email en base de datos
 */
interface EmailLogPayload {
    recipient_email: string;
    subject: string;
    body_html: string;
    type: 'welcome' | 'lead' | 'booking_request' | 'booking_status';
    status: 'sent' | 'simulated' | 'failed';
}

/**
 * Registra el correo en la tabla public.email_logs de Supabase para auditoría del coach
 */
const logEmailToDatabase = async (payload: EmailLogPayload) => {
    try {
        const { error } = await supabase
            .from('email_logs')
            .insert([payload]);
        if (error) {
            // Si la tabla no está creada aún o hay RLS, imprimimos amablemente por consola
            console.warn("No se pudo insertar en la tabla email_logs (¿has ejecutado la migración SQL?):", error.message);
        }
    } catch (err) {
        console.error("Error al registrar email log:", err);
    }
};

/**
 * Función genérica de envío a través de la API REST de Resend
 */
export const sendEmail = async (
    to: string,
    subject: string,
    bodyHtml: string,
    type: 'welcome' | 'lead' | 'booking_request' | 'booking_status'
): Promise<{ success: boolean; simulated: boolean; error?: string }> => {
    const apiKey = getResendApiKey();

    if (!apiKey) {
        // Modo simulación si no hay API Key configurada
        console.log(`%c[SIMULACIÓN EMAIL: ${type.toUpperCase()}]`, 'background: #10b981; color: black; font-weight: bold; padding: 2px 5px; border-radius: 3px;');
        console.log(`Para: ${to}`);
        console.log(`Asunto: ${subject}`);
        console.log("Contenido HTML:");
        console.log(bodyHtml);

        // Registrar como simulado en la base de datos
        await logEmailToDatabase({
            recipient_email: to,
            subject,
            body_html: bodyHtml,
            type,
            status: 'simulated'
        });

        // Crear una notificación nativa temporal en el navegador para dar feedback visual inmediato
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Email Enviado (Simulado)`, { body: `${subject} para ${to}` });
        }

        return { success: true, simulated: true };
    }

    try {
        // Envío real utilizando la API REST de Resend
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'FitLeader <onboarding@resend.dev>', // Email sandbox por defecto de Resend
                to: [to],
                subject: subject,
                html: bodyHtml
            })
        });

        const data = await response.json();

        if (response.ok) {
            await logEmailToDatabase({
                recipient_email: to,
                subject,
                body_html: bodyHtml,
                type,
                status: 'sent'
            });
            return { success: true, simulated: false };
        } else {
            await logEmailToDatabase({
                recipient_email: to,
                subject,
                body_html: bodyHtml,
                type,
                status: 'failed'
            });
            return { success: false, simulated: false, error: data.message || 'Error en Resend' };
        }
    } catch (err: any) {
        console.error("Error al enviar email real:", err);
        return { success: false, simulated: false, error: err.message };
    }
};

/**
 * CASO 1: Email de Bienvenida y Onboarding de nuevos coaches
 */
export const sendWelcomeCoachEmail = async (coachEmail: string, coachName: string = 'Entrenador') => {
    const subject = '¡Bienvenido a FitLeader! 🚀 Guía de inicio rápido para exprimir tu plataforma al máximo';
    
    const bodyHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1f2937;">
        <div style="text-align: center; margin-bottom: 30px;">
            <span style="font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: -1px; font-style: italic;">FitLeader</span>
        </div>
        
        <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; text-align: center;">📖 LA GUÍA DEFINITIVA: CÓMO USAR FITLEADER AL 100%</h2>
        
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">Hola <strong>${coachName}</strong>,</p>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">¡Bienvenido a la comunidad de <strong>FitLeader</strong>! Hemos preparado esta guía de inicio rápido para ayudarte a exprimir todas las funcionalidades de la plataforma al máximo desde el primer día:</p>
        
        <div style="background-color: #111; border: 1px solid #222; border-left: 4px solid #10b981; padding: 18px; margin: 25px 0; border-radius: 8px;">
            <h3 style="color: #ffffff; margin-top: 0; font-size: 15px; font-weight: bold; margin-bottom: 10px;">💻 PARTE 1: EL PANEL DEL ENTRENADOR (TU CENTRO DE MANDOS)</h3>
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">Esta es tu plataforma principal (SaaS), accesible desde tu ordenador o tablet. Aquí controlas todo tu negocio:</p>
            <ul style="color: #cbd5e1; font-size: 13px; padding-left: 20px; line-height: 1.8; margin-bottom: 0;">
                <li style="margin-bottom: 8px;"><strong>1. Dashboard (Inicio)</strong>: Tu resumen visual diario. Aquí verás de un vistazo rápido cuántos clientes activos tienes, los ingresos del mes, y qué atletas han completado sus entrenamientos recientes.</li>
                <li style="margin-bottom: 8px;"><strong>2. Clientes (Gestión de Atletas)</strong>: Tu base de datos profesional. Puedes añadir atletas, consultar historiales, lesiones o notas internas. <br><span style="color: #10b981;"><strong>🔑 CLAVE DE ACCESO:</strong> Al crear un cliente, el sistema generará una "Clave de acceso" única. Esta es la contraseña que le darás a tu atleta para que pueda entrar a su App Cliente junto con su correo electrónico.</span></li>
                <li style="margin-bottom: 8px;"><strong>3. Entrenamientos / Rutinas</strong>: El corazón de tu servicio. Diseña bloques de entrenamiento día por día con series, repeticiones y descansos, y asígnalos directamente en un par de clics.</li>
                <li style="margin-bottom: 8px;"><strong>4. Agenda / Calendario</strong>: Organiza tu tiempo. Si das sesiones presenciales o videollamadas, aquí puedes agendar todas las citas con tus clientes para no solapar horarios.</li>
                <li style="margin-bottom: 8px;"><strong>5. Finanzas</strong>: Control total de tu dinero. Registra cobros y deudas, revisa tus ingresos y utiliza la herramienta de <strong>📊 Exportar a Excel</strong> para descargar todos tus registros financieros en un solo clic (.csv o .xlsx).</li>
                <li style="margin-bottom: 8px;"><strong>6. Reportes y Progreso</strong>: Observa la evolución de peso, medidas o marcas personales de tus clientes para ajustar planificaciones basadas en datos reales.</li>
            </ul>
        </div>
        
        <div style="background-color: #111; border: 1px solid #222; border-left: 4px solid #3b82f6; padding: 18px; margin: 25px 0; border-radius: 8px;">
            <h3 style="color: #ffffff; margin-top: 0; font-size: 15px; font-weight: bold; margin-bottom: 10px;">🌟 ¡NUEVAS FUNCIONALIDADES EXCLUSIVAS!</h3>
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">Hemos incorporado herramientas revolucionarias para ayudarte a captar clientes y rentabilizar tu negocio:</p>
            <ul style="color: #cbd5e1; font-size: 13px; padding-left: 20px; line-height: 1.8; margin-bottom: 0;">
                <li style="margin-bottom: 8px;"><strong>🌐 Perfil Público en el Marketplace B2C</strong>: Entra en <strong>Ajustes > Marketplace</strong>, activa tu perfil público, biografía, especialidades y tarifas. Aparecerás en el listado público de entrenadores de FitLeader para captar nuevos atletas locales y online. ¡Gestiona tus Leads entrantes desde el panel!</li>
                <li style="margin-bottom: 8px;"><strong>🏢 Alquiler de Espacios B2B</strong>: En la sección <strong>Centros</strong>, explora salas de entrenamiento funcional o musculación en gimnasios locales y resérvalas por horas. Paga de forma flexible y entrena a tus clientes presenciales sin costes fijos de local.</li>
                <li style="margin-bottom: 8px;"><strong>🍏 Planificación de Nutrición (Plan Elite)</strong>: Diseña la nutrición de tus clientes de forma integrada. Configura calorías objetivo y macronutrientes (proteínas, grasas, carbohidratos), crea menús de comidas y sigue su progreso diario.</li>
                <li style="margin-bottom: 8px;"><strong>💬 Chat en Vivo en Tiempo Real (Plan Elite)</strong>: Mantén una comunicación directa, motivadora e instantánea con tus atletas desde tu bandeja de entrada unificada en la sección <strong>Chat</strong>.</li>
            </ul>
        </div>
        
        <div style="background-color: #111; border: 1px solid #222; border-left: 4px solid #f59e0b; padding: 18px; margin: 25px 0; border-radius: 8px;">
            <h3 style="color: #ffffff; margin-top: 0; font-size: 15px; font-weight: bold; margin-bottom: 10px;">📱 PARTE 2: LA APP CLIENTE (LA EXPERIENCIA DE TU ATLETA)</h3>
            <p style="color: #a8a29e; font-size: 13px; margin-bottom: 15px;">FitLeader no es solo para ti, es una herramienta para fidelizar a tus clientes dándoles una experiencia premium en sus teléfonos.</p>
            <p style="color: #d6d3d1; font-size: 13px; margin-bottom: 10px;"><strong>¿Cómo accede el cliente a su App?</strong></p>
            <ol style="color: #cbd5e1; font-size: 13px; padding-left: 20px; line-height: 1.8; margin-bottom: 15px;">
                <li>Entrará en el enlace que tú le des: <code>/client-app</code>.</li>
                <li>Iniciará sesión con su email y la Clave de Acceso secreta que generaste en su ficha de cliente.</li>
            </ol>
            <p style="color: #d6d3d1; font-size: 13px; margin-bottom: 10px;"><strong>Instalar como una App nativa (PWA):</strong></p>
            <ul style="color: #cbd5e1; font-size: 13px; padding-left: 20px; line-height: 1.8; margin-bottom: 0;">
                <li style="margin-bottom: 6px;"><strong>En iPhone (Safari)</strong>: Pulsar el icono de "Compartir" en la barra inferior, deslizar y pulsar en "Añadir a la pantalla de inicio" (+).</li>
                <li style="margin-bottom: 6px;"><strong>En Android (Chrome)</strong>: Tocar los 3 puntitos arriba a la derecha y seleccionar "Añadir a la pantalla principal".</li>
            </ul>
        </div>
        
        <p style="color: #10b981; font-size: 14px; font-weight: bold; text-align: center; margin-top: 30px; margin-bottom: 0;">
            ¡A por todas en esta nueva etapa! El equipo de FitLeader.
        </p>
    </div>
    `;

    return await sendEmail(coachEmail, subject, bodyHtml, 'welcome');
};

/**
 * CASO 2: Email de nuevo Lead de Marketplace
 */
export const sendMarketplaceLeadEmail = async (
    coachEmail: string,
    leadName: string,
    leadEmail: string,
    leadPhone: string | null,
    goals: string | null,
    experience: string | null
) => {
    const subject = '📩 ¡Nuevo cliente interesado! Has recibido un Lead en tu Marketplace';

    const bodyHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1f2937;">
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: -1px; font-style: italic;">FitLeader</span>
        </div>
        
        <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 20px;">📩 ¡Nuevo Lead de Marketplace!</h2>
        
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; text-align: center;">
            Un atleta se ha interesado en tu perfil del directorio y ha dejado sus datos de contacto para empezar a entrenar contigo.
        </p>
        
        <div style="background-color: #111; border: 1px solid #222; padding: 20px; border-radius: 12px; margin: 20px 0; space-y: 12px;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Nombre:</strong> <span style="color: #fff; font-weight: bold;">${leadName}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Email:</strong> <span style="color: #fff; font-weight: bold;">${leadEmail}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Teléfono:</strong> <span style="color: #fff; font-weight: bold;">${leadPhone || 'No facilitado'}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Nivel de Experiencia:</strong> <span style="color: #fff; font-weight: bold;">${experience || 'No especificado'}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Objetivos del Atleta:</strong></p>
            <p style="color: #cbd5e1; font-size: 13px; background-color: #18181b; padding: 10px; border-radius: 6px; margin: 0; line-height: 1.5;">
                ${goals || 'No detallados.'}
            </p>
        </div>
        
        <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 25px;">
            Inicia sesión en tu panel para ver más detalles y aceptar al cliente en tu lista de atletas activos.
        </p>
        
        <div style="text-align: center;">
            <a href="https://fitleader.com/dashboard/clients" style="background-color: #10b981; color: #000; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 25px; border-radius: 8px; display: inline-block;">
                Ver en mi Dashboard
            </a>
        </div>
    </div>
    `;

    return await sendEmail(coachEmail, subject, bodyHtml, 'lead');
};

/**
 * CASO 3: Email de nueva Solicitud de Reserva B2B para Centros
 */
export const sendBookingRequestEmail = async (
    centerEmail: string,
    coachName: string,
    spaceName: string,
    date: string,
    startTime: string,
    endTime: string,
    amount: number
) => {
    const subject = '🏢 ¡Nueva solicitud de reserva externa en tu centro deportivo!';

    const bodyHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1f2937;">
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: -1px; font-style: italic;">FitLeader</span>
        </div>
        
        <h2 style="color: #ffffff; font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 20px;">🏢 Nueva Solicitud de Alquiler de Espacio</h2>
        
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; text-align: center;">
            Un entrenador externo (freelance) desea reservar una de tus salas habilitadas en el marketplace.
        </p>
        
        <div style="background-color: #111; border: 1px solid #222; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Entrenador:</strong> <span style="color: #fff; font-weight: bold;">${coachName}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Zona Solicitada:</strong> <span style="color: #fff; font-weight: bold;">${spaceName}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Fecha:</strong> <span style="color: #fff; font-weight: bold;">${new Date(date).toLocaleDateString()}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Horario:</strong> <span style="color: #fff; font-weight: bold;">${startTime} - ${endTime}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Importe Estimado:</strong> <span style="color: #10b981; font-weight: bold;">${amount.toFixed(2)} €</span></p>
        </div>
        
        <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 25px;">
            Accede a la sección "Espacios" de tu panel para aceptar o rechazar esta reserva y verificar el estado del pago.
        </p>
        
        <div style="text-align: center;">
            <a href="https://fitleader.com/dashboard/spaces" style="background-color: #10b981; color: #000; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 25px; border-radius: 8px; display: inline-block;">
                Gestionar Reservas
            </a>
        </div>
    </div>
    `;

    return await sendEmail(centerEmail, subject, bodyHtml, 'booking_request');
};

/**
 * CASO 4: Email de Aprobación/Rechazo de Reserva para el Coach Freelance
 */
export const sendBookingStatusEmail = async (
    coachEmail: string,
    spaceName: string,
    status: 'approved' | 'rejected',
    date: string,
    startTime: string,
    endTime: string,
    centerName: string,
    contactPhone: string | null
) => {
    const isApproved = status === 'approved';
    const statusText = isApproved ? 'APROBADA' : 'RECHAZADA';
    const subject = isApproved 
        ? `✅ ¡Reserva Aprobada! Tu espacio en ${centerName} está confirmado`
        : `✕ Solicitud de Reserva no disponible en ${centerName}`;

    const bodyHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050505; color: #f4f4f5; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 20px; border: 1px solid #1f2937;">
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 24px; font-weight: bold; color: #10b981; letter-spacing: -1px; font-style: italic;">FitLeader</span>
        </div>
        
        <h2 style="color: ${isApproved ? '#10b981' : '#f87171'}; font-size: 18px; font-weight: 800; text-align: center; margin-bottom: 20px;">
            ${isApproved ? '✅ Reserva Confirmada' : '✕ Reserva Cancelada/Rechazada'}
        </h2>
        
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; text-align: center;">
            El centro deportivo <strong>${centerName}</strong> ha marcado tu solicitud de reserva como <strong>${statusText}</strong>.
        </p>
        
        <div style="background-color: #111; border: 1px solid #222; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Espacio:</strong> <span style="color: #fff; font-weight: bold;">${spaceName}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Fecha:</strong> <span style="color: #fff; font-weight: bold;">${new Date(date).toLocaleDateString()}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Horario:</strong> <span style="color: #fff; font-weight: bold;">${startTime} - ${endTime}</span></p>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Centro Deportivo:</strong> <span style="color: #fff; font-weight: bold;">${centerName}</span></p>
            ${contactPhone ? `<p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;"><strong>Teléfono de contacto:</strong> <span style="color: #fff; font-weight: bold;">${contactPhone}</span></p>` : ''}
        </div>
        
        <p style="color: #a1a1aa; font-size: 13px; line-height: 1.5; text-align: center; margin-bottom: 25px;">
            ${isApproved 
                ? '¡Ya puedes asistir con tu atleta al espacio reservado en la fecha y hora indicadas! Recuerda cumplir con las normas del centro.'
                : 'Lamentamos las molestias. La sala puede estar ocupada o cerrada en ese horario. Puedes probar a reservar en otra fecha u otro centro.'
            }
        </p>
        
        <div style="text-align: center;">
            <a href="https://fitleader.com/dashboard/centers" style="background-color: ${isApproved ? '#10b981' : '#3f3f46'}; color: ${isApproved ? '#000' : '#fff'}; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 25px; border-radius: 8px; display: inline-block;">
                Ver mis reservas
            </a>
        </div>
    </div>
    `;

    return await sendEmail(coachEmail, subject, bodyHtml, 'booking_status');
};
