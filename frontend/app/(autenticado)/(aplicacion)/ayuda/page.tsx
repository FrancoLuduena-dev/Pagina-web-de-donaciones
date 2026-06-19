import styles from "./ayuda.module.css";
import { tituloPagina } from "@/constants/site";

export default function ayuda() {
  const preguntasFrecuentes = [
{
  pregunta: `¿Qué es ${tituloPagina}?`,
  respuesta: `${tituloPagina} es una plataforma que permite publicar y encontrar objetos para donar de forma gratuita. Nuestro objetivo es conectar personas que desean donar con quienes necesitan esos objetos.`,
},
    {
      pregunta: "¿Publicar una donación tiene algún costo?",
      respuesta:
        "No. Publicar, solicitar y recibir donaciones es completamente gratuito.",
    },
    {
      pregunta: "¿Cómo puedo publicar una publicación?",
      respuesta:
        "Podés crear una publicación completando el formulario correspondiente con el título, descripción, categoría, estado del objeto y una imagen.",
    },
    {
      pregunta: "¿Quién puede solicitar una publicación?",
      respuesta:
        "Cualquier usuario puede enviar una solicitud para recibir una publicación disponible.",
    },
    {
      pregunta: "¿Cómo sé si mi solicitud fue aceptada?",
      respuesta:
        "Cuando el dueño de la publicación acepte o rechace tu solicitud, podrás ver el estado actualizado en la sección Solicitudes Realizadas.",
    },
    {
      pregunta: "¿Puedo cancelar una solicitud enviada?",
      respuesta:
        "Sí. Mientras la solicitud siga pendiente, podés cancelarla desde la sección Solicitudes Realizadas.",
    },
    {
      pregunta: "¿Puedo rechazar solicitudes para mis publicaciones?",
      respuesta:
        "Sí. Como dueño de una publicación, podés aceptar o rechazar las solicitudes recibidas. También podés indicar un motivo de rechazo.",
    },
    {
      pregunta: "¿Qué ocurre cuando una solicitud es aceptada?",
      respuesta:
        "El solicitante podrá ver la información de contacto del donante para coordinar la entrega del objeto.",
    },
    {
      pregunta: "¿Qué tipos de objetos puedo publicar?",
      respuesta:
        "Se pueden publicar objetos en buen estado que sean útiles para otras personas, como ropa, muebles, útiles escolares, libros, juguetes y artículos para el hogar.",
    },
    {
      pregunta: "¿Qué objetos no están permitidos?",
      respuesta:
        "No se permiten publicaciones de dinero, productos ilegales, armas, sustancias peligrosas, contenido ofensivo o discriminatorio, ni cualquier elemento prohibido por la legislación vigente.",
    },
    {
      pregunta: "¿Qué hago si encuentro una publicación inapropiada?",
      respuesta:
        "Podés reportarla utilizando la opción Denunciar disponible en la publicación.",
    },
    {
      pregunta: "¿Qué pasa si un usuario incumple las normas?",
      respuesta:
        "Los moderadores pueden revisar denuncias y aplicar medidas que incluyen advertencias, suspensión o bloqueo de cuentas.",
    },
    {
      pregunta: "¿Cómo protegen mis datos personales?",
      respuesta:
        "Tus datos personales no se muestran públicamente. Solo cierta información de contacto se comparte cuando una solicitud es aceptada para facilitar la coordinación de la entrega.",
    },
    {
      pregunta: "¿Puedo editar o eliminar una publicación?",
      respuesta:
        "Sí. Desde Mis Publicaciones podés modificar o eliminar publicaciones que te pertenezcan.",
    },
  ];

  return (
    <main className={styles.main}>
      <h1 className={styles.titulo}>Preguntas Frecuentes</h1>

      <div className={styles.listaPreguntas}>
        {preguntasFrecuentes.map((item) => (
          <section key={item.pregunta} className={styles.pregunta}>
            <h2>{item.pregunta}</h2>
            <p>{item.respuesta}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
