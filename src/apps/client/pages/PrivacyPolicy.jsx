import React from "react";
import SectionHeader from "../components/SectionHeader";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card-premium p-8 md:p-12 animate-slide-up">
          <SectionHeader
            title="Informativa sulla Privacy"
            subtitle="Ultimo aggiornamento: Ottobre 2026"
          />

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              La tua privacy è importante per noi di <strong>Azzipizza Mica Pizza e Fichi</strong>. 
              La presente Informativa sulla Privacy spiega come raccogliamo, utilizziamo e proteggiamo 
              le tue informazioni personali quando visiti il nostro sito web <strong>azzipizza.it</strong> o effettui un ordine da asporto.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">1. Informazioni che Raccogliamo</h3>
            <p>
              Quando interagisci con il nostro sito o effettui un ordine, potremmo raccogliere le seguenti informazioni:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Dati di contatto:</strong> Nome, cognome, indirizzo email e numero di telefono (specialmente se ci contatti tramite WhatsApp).</li>
              <li><strong>Dati di consegna:</strong> Indirizzo fisico qualora sia richiesta la consegna a domicilio.</li>
              <li><strong>Dati di navigazione:</strong> Informazioni anonime su come utilizzi il nostro sito web (tramite cookie tecnici necessari al funzionamento).</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">2. Come Utilizziamo le Tue Informazioni</h3>
            <p>
              Le tue informazioni personali vengono utilizzate esclusivamente per le seguenti finalità:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Per elaborare e completare i tuoi ordini (asporto o consegna).</li>
              <li>Per comunicare con te in merito al tuo ordine (tramite telefono o WhatsApp).</li>
              <li>Per rispondere a eventuali richieste, domande o feedback inviati tramite il modulo di contatto.</li>
              <li>Per adempiere a obblighi legali e fiscali.</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">3. Condivisione dei Dati</h3>
            <p>
              Non vendiamo, scambiamo né affittiamo le tue informazioni personali a terze parti. Potremmo condividere 
              i tuoi dati esclusivamente con fornitori di servizi di fiducia necessari al funzionamento del sito e 
              all'evasione degli ordini (es. piattaforme di pagamento o servizi di consegna affiliati), i quali sono 
              tenuti a mantenere tali informazioni strettamente confidenziali.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">4. Sicurezza dei Dati</h3>
            <p>
              Adottiamo misure di sicurezza appropriate per proteggere le tue informazioni personali da accesso 
              non autorizzato, alterazione, divulgazione o distruzione. I dati inseriti nel nostro sito sono 
              protetti tramite protocollo crittografato (SSL).
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">5. I Tuoi Diritti</h3>
            <p>
              Ai sensi del GDPR, hai il diritto di accedere alle tue informazioni personali in nostro possesso, 
              richiederne la rettifica, la cancellazione o limitarne il trattamento. Per esercitare questi diritti, 
              puoi contattarci in qualsiasi momento.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">6. Contatti</h3>
            <p>
              Per qualsiasi domanda o dubbio riguardo questa Informativa sulla Privacy, puoi contattarci a:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="font-semibold text-gray-800">Azzipizza Mica Pizza e Fichi</p>
              <p>📍 Via Frassinago, 16b, 40123 Bologna BO, Italy</p>
              <p>📞 +39 371 398 5810</p>
              <p>✉️ azzipizzamicapizzaefichi@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
