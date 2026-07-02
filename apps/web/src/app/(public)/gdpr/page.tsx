import LegalContentPage from '@/components/legal/LegalContentPage'

const contactEmail = 'afroglowstudiostudio@gmail.com'

const copy = {
  en: {
    eyebrow: 'GDPR',
    title: 'GDPR Data Rights',
    intro: 'Afroglow respects data protection rights under the General Data Protection Regulation. This page explains the main rights available to people whose personal data we process.',
    updated: 'Last updated: July 2, 2026',
    back: 'Back to home',
    contactTitle: 'Submit a GDPR request',
    contactText: 'Email us with the right you want to exercise and the email or phone number connected to your booking or account. We may ask for verification before acting on the request.',
    contactEmail,
    sections: [
      {
        title: 'Your GDPR rights',
        items: [
          'Right of access: you can ask what personal data we hold about you.',
          'Right to rectification: you can ask us to correct inaccurate or incomplete data.',
          'Right to erasure: you can ask us to delete data when there is no longer a valid reason to keep it.',
          'Right to restriction: you can ask us to temporarily limit how your data is used.',
          'Right to portability: you can ask for certain data in a structured, commonly used format.',
          'Right to object: you can object to some types of processing, depending on the legal basis.',
        ],
      },
      {
        title: 'Legal bases we may rely on',
        items: [
          'Contract: to provide bookings, accounts, professional access, and rental application handling.',
          'Legitimate interests: to run the salon, protect the platform, manage admin records, and improve services.',
          'Consent: where we ask for optional permission, such as selected marketing or optional media use.',
          'Legal obligation: to keep records required for accounting, tax, consumer protection, or legal claims.',
        ],
      },
      {
        title: 'How to make a request',
        body: 'Send your request by email and clearly state whether you want access, correction, deletion, restriction, portability, or objection. Please include enough information for us to identify the relevant booking, account, or professional profile.',
      },
      {
        title: 'Response time',
        body: 'We aim to respond within one month where required by GDPR. Complex or repeated requests may take longer, and we will let you know if an extension is needed.',
      },
      {
        title: 'When deletion may not be possible',
        body: 'Some records may need to be kept for legal, accounting, security, dispute resolution, or legitimate operational reasons. When full deletion is not possible, we will explain why and limit data where appropriate.',
      },
      {
        title: 'Complaints',
        body: 'If you are unhappy with how your data is handled, contact us first so we can try to resolve the issue. You may also contact the Lithuanian data protection authority or another relevant EU supervisory authority.',
      },
    ],
  },
  lt: {
    eyebrow: 'BDAR',
    title: 'BDAR duomenų teisės',
    intro: 'Afroglow gerbia duomenų apsaugos teises pagal Bendrąjį duomenų apsaugos reglamentą. Šiame puslapyje paaiškinamos pagrindinės teisės asmenims, kurių duomenis tvarkome.',
    updated: 'Paskutinį kartą atnaujinta: 2026 m. liepos 2 d.',
    back: 'Grįžti į pradžią',
    contactTitle: 'Pateikti BDAR prašymą',
    contactText: 'Parašykite mums el. paštu, kokia teise norite pasinaudoti, ir nurodykite el. paštą arba telefono numerį, susietą su jūsų rezervacija ar paskyra. Prieš vykdydami prašymą galime paprašyti patvirtinti tapatybę.',
    contactEmail,
    sections: [
      {
        title: 'Jūsų BDAR teisės',
        items: [
          'Teisė susipažinti: galite klausti, kokius jūsų asmens duomenis turime.',
          'Teisė ištaisyti: galite prašyti pataisyti netikslius arba neišsamius duomenis.',
          'Teisė ištrinti: galite prašyti ištrinti duomenis, kai nebėra pagrįstos priežasties juos saugoti.',
          'Teisė apriboti tvarkymą: galite prašyti laikinai apriboti duomenų naudojimą.',
          'Teisė į perkeliamumą: galite prašyti tam tikrų duomenų struktūrizuotu, įprastai naudojamu formatu.',
          'Teisė nesutikti: galite nesutikti su kai kuriu duomenų tvarkymu, priklausomai nuo teisinio pagrindo.',
        ],
      },
      {
        title: 'Teisiniai pagrindai, kuriais galime remtis',
        items: [
          'Sutartis: rezervacijoms, paskyroms, specialistų prieigai ir nuomos paraiškoms tvarkyti.',
          'Teisėti interesai: salonui valdyti, platformai apsaugoti, administravimo įrašams tvarkyti ir paslaugoms gerinti.',
          'Sutikimas: kai prašome pasirenkamo leidimo, pvz., tam tikrai rinkodarai ar pasirenkamam nuotraukų naudojimui.',
          'Teisinė prievolė: saugoti įrašus, reikalingus apskaitai, mokesčiams, vartotojų apsaugai ar teisiniams reikalavimams.',
        ],
      },
      {
        title: 'Kaip pateikti prašymą',
        body: 'Siųskite prašymą el. paštu ir aiškiai nurodykite, ar norite susipažinti su duomenimis, juos pataisyti, ištrinti, apriboti, perkelti ar nesutikti su tvarkymu. Pateikite pakankamai informacijos, kad galėtume rasti susijusią rezervaciją, paskyrą ar specialisto profilį.',
      },
      {
        title: 'Atsakymo terminas',
        body: 'Siekime atsakyti per vieną mėnesį, kai to reikalauja BDAR. Sudėtingi arba pasikartojantys prašymai gali užtrukti ilgiau, o jei reikės pratęsimo, apie tai informuosime.',
      },
      {
        title: 'Kada ištrynimas gali būti neįmanomas',
        body: 'Kai kuriuos įrašus gali reikėti saugoti dėl teisinių, apskaitos, saugumo, ginčų sprendimo ar teisėtų veiklos priežasčių. Jei visiškas ištrynimas neįmanomas, paaiškinsime kodėl ir, kai tinkama, apribosime duomenų naudojimą.',
      },
      {
        title: 'Skundai',
        body: 'Jei nesate patenkinti, kaip tvarkomi jūsų duomenys, pirmiausia susisiekite su mumis, kad galėtume pabandyti išspręsti klausimą. Taip pat galite kreiptis į Lietuvos duomenų apsaugos instituciją arba kitą atitinkamą ES priežiūros instituciją.',
      },
    ],
  },
}

export default function GdprPage() {
  return <LegalContentPage icon="gdpr" copy={copy} />
}
