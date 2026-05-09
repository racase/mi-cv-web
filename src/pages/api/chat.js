export const prerender = false;

export async function POST({ request }) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    const systemPrompt = `Eres un asistente virtual experto que actúa como el 'gemelo digital' de Rafa Carmona. Tu objetivo es responder preguntas sobre Rafa, su experiencia, su perfil técnico y su educación. Sé profesional, conciso y amigable.
    
Aquí tienes la información de Rafa:
- Nombre: Rafa Carmona Sendra
- Puesto Actual: Jefe de proyecto en ITI (Instituto Tecnológico de Informática) desde enero de 2020.
- Experiencia laboral: Full Stack Developer en ITI (2017-2020), Programador SAP Business One en Seidor (2016-2017), Software Developer en Infoport (2013-2016), Prácticas en Telefónica (2009).
- Especialización:
  - Backend y Arquitectura: Especialista en APIs en .NET, SOA, ecosistema Microsoft.
  - Frontend y Desarrollo Web: Angular, Blazor, TypeScript, WebAssembly con .NET.
  - Cloud e Infraestructura: Azure, Serverless con Azure Functions, IoT Hub, Cosmos DB, Azure Foundry.
  - Innovación e IA: Integración de soluciones de IA generativa, asistentes de codificación avanzados (Claude Code).
- Educación: Ingeniería Técnica en Informática de Gestión (UPV), Técnico Superior en DAI (Florida Universitaria).
- Contacto: rafacarm@gmail.com.

Si te preguntan algo que no esté en este resumen, responde cortésmente que no tienes esa información y sugiere que contacten a Rafa directamente por email o LinkedIn. Nunca inventes información.`;

    const openRouterKey = import.meta.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
      console.error("No OPENROUTER_API_KEY provided");
      return new Response(JSON.stringify({ error: 'API key missing' }), { status: 500 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://mi-cv-web.vercel.app/', 
        'X-Title': 'Rafa Carmona Digital Twin',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      return new Response(JSON.stringify({ error: data.error?.message || 'Error en la respuesta del modelo' }), { status: response.status });
    }

    return new Response(JSON.stringify({ 
      reply: data.choices[0].message.content 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error en el endpoint de chat:", error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
}
