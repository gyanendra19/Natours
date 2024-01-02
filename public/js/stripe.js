import axios from 'axios';


export const bookTour = async (tourId) => {
    const stripe = Stripe('pk_test_51ORqDlSGPr6vX72eYlOsMckKDtSTJ55z8igVWzlAcbPPf2CqSjaYvJ1vpCOlxjmxaFPgeoGEUWSPFvTsfK0If25E00SbFAILp0')

   try {
    const session = await axios(`http://127.0.0.1:3000/bookings/checkout/${tourId}`)

    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })

}catch(err){
    console.log(err)
}
}