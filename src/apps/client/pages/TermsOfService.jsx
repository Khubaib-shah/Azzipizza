import React from "react";
import SectionHeader from "../components/SectionHeader";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card-premium p-8 md:p-12 animate-slide-up">
          <SectionHeader
            title="Termini e Condizioni di Servizio"
            subtitle="Ultimo aggiornamento: Ottobre 2026"
          />

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              Benvenuti su <strong>Azzipizza Mica Pizza e Fichi</strong>. Utilizzando il nostro sito web 
              (<strong>azzipizza.it</strong>) o effettuando un ordine, l'utente accetta di essere vincolato 
              dai seguenti Termini e Condizioni. Ti invitiamo a leggerli attentamente.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">1. Informazioni sull'Azienda</h3>
            <p>
              Il sito web e i servizi ad esso collegati sono gestiti da:<br />
              <strong>Azzipizza Mica Pizza e Fichi</strong><br />
              Via Frassinago, 16b, 40123 Bologna BO, Italy.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">2. Effettuazione e Gestione degli Ordini</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Disponibilità:</strong> Tutti i prodotti, inclusi pizze e fritti, sono soggetti a disponibilità. In caso di ingredienti mancanti, ti contatteremo tempestivamente per proporre un'alternativa.</li>
              <li><strong>Prezzi:</strong> I prezzi indicati sul sito sono in Euro (€) e includono l'IVA applicabile. Ci riserviamo il diritto di modificare i prezzi in qualsiasi momento senza preavviso; tuttavia, gli ordini già confermati manterranno il prezzo originario.</li>
              <li><strong>Accettazione:</strong> Un ordine si intende confermato solo dopo nostra esplicita accettazione, comunicata tramite la piattaforma, via email o WhatsApp.</li>
            </ul>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">3. Consegna e Ritiro (Asporto)</h3>
            <p>
              Il cliente è tenuto a fornire informazioni accurate riguardo all'indirizzo di consegna e al 
              numero di telefono. Eventuali ritardi causati da informazioni errate non saranno imputabili a Azzipizza. 
              Per l'asporto, ti preghiamo di rispettare l'orario di ritiro indicato al momento dell'ordine per garantire 
              la massima freschezza del prodotto.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">4. Annullamenti e Rimborsi</h3>
            <p>
              Poiché i nostri prodotti sono deperibili e preparati su ordinazione, gli ordini non possono 
              essere annullati una volta che la preparazione è iniziata. Qualora si verifichino gravi ritardi 
              o errori da parte nostra (es. prodotto errato o gravemente danneggiato), ti preghiamo di contattarci 
              immediatamente al momento della consegna/ritiro per organizzare una sostituzione o un rimborso parziale/totale.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">5. Allergeni e Intolleranze</h3>
            <p>
              Nei nostri locali utilizziamo farine contenenti glutine, latticini e altre sostanze che possono 
              causare allergie. Sebbene prestiamo la massima attenzione, non possiamo garantire l'assenza totale 
              di contaminazioni crociate. È responsabilità del cliente segnalare eventuali allergie gravi prima 
              di effettuare l'ordine.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">6. Proprietà Intellettuale</h3>
            <p>
              Tutti i contenuti presenti sul sito (logo, immagini, testi) sono di proprietà esclusiva di 
              Azzipizza Mica Pizza e Fichi. Ne è vietata la riproduzione o l'uso non autorizzato.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mt-8">7. Legge Applicabile e Foro Competente</h3>
            <p>
              I presenti Termini e Condizioni sono regolati dalla legge italiana. Per qualsiasi controversia 
              derivante dall'utilizzo del sito o dei nostri servizi, sarà competente in via esclusiva il Foro di Bologna.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
