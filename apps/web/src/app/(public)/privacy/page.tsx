import LegalContentPage from '@/components/legal/LegalContentPage'

const contactEmail = 'afroglowstudiostudio@gmail.com'

const copy = {
  en: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    intro: 'This policy explains how Afroglow collects, uses, protects, and stores personal information when you use our website, book services, contact us, or apply to rent a professional working spot.',
    updated: 'Last updated: July 2, 2026',
    back: 'Back to home',
    contactTitle: 'Privacy questions',
    contactText: 'If you want to access, correct, or delete your personal data, contact us and we will respond as soon as reasonably possible.',
    contactEmail,
    sections: [
      {
        title: 'Information we collect',
        items: [
          'Contact details such as your name, email address, phone number, and booking notes.',
          'Booking details such as selected service, professional, date, time, price, and appointment status.',
          'Professional application details such as experience, specialization, portfolio links, social handles, and rental preferences.',
          'Account details for clients, professionals, and administrators when an account is created.',
          'Technical data such as browser type, device information, pages visited, and basic security logs.',
        ],
      },
      {
        title: 'How we use your information',
        items: [
          'To create, confirm, manage, and display bookings in the client and admin panels.',
          'To manage services, prices, professionals, working hours, gallery content, and rental applications.',
          'To contact you about appointments, rental applications, account activity, or service changes.',
          'To improve the website, protect accounts, prevent abuse, and keep operational records.',
          'To comply with legal, tax, accounting, and consumer protection obligations where they apply.',
        ],
      },
      {
        title: 'Who can access your information',
        body: 'Afroglow administrators can access operational information needed to run the salon, manage bookings, and support clients and professionals. Professionals may see booking details relevant to their own appointments. We do not sell personal data.',
      },
      {
        title: 'How long we keep data',
        body: 'We keep personal data only for as long as needed for the purpose it was collected, including bookings, customer support, legal obligations, accounting records, dispute handling, and platform security.',
      },
      {
        title: 'Your choices',
        items: [
          'You can request a copy of your personal data.',
          'You can ask us to correct inaccurate or incomplete information.',
          'You can ask us to delete data when we no longer need it for legitimate business or legal reasons.',
          'You can object to certain processing or ask us to restrict how data is used.',
        ],
      },
      {
        title: 'Security',
        body: 'We use reasonable technical and organizational measures to protect personal data. No online service is completely risk-free, so please use strong passwords and contact us if you notice suspicious activity.',
      },
    ],
  },
  lt: {
    eyebrow: 'Privatumas',
    title: 'Privatumo politika',
    intro: 'Šioje politikoje paaiškinama, kaip Afroglow renka, naudoja, saugo ir tvarko asmens informaciją, kai naudojatės svetaine, rezervuojate paslaugas, susisiekiate su mumis arba teikiate paraišką darbo vietos nuomai.',
    updated: 'Paskutinį kartą atnaujinta: 2026 m. liepos 2 d.',
    back: 'Grįžti į pradžią',
    contactTitle: 'Klausimai dėl privatumo',
    contactText: 'Jei norite gauti, pataisyti arba ištrinti savo asmens duomenis, susisiekite su mumis ir atsakysime kiek įmanoma greičiau.',
    contactEmail,
    sections: [
      {
        title: 'Kokią informaciją renkame',
        items: [
          'Kontaktinius duomenis, pvz., vardą, el. paštą, telefono numerį ir rezervacijos pastabas.',
          'Rezervacijos duomenis, pvz., pasirinktą paslaugą, specialistą, datą, laiką, kainą ir vizito būseną.',
          'Specialisto paraiškos duomenis, pvz., patirtį, specializaciją, portfolio nuorodas, socialinių tinklų paskyras ir nuomos pageidavimus.',
          'Klientų, specialistų ir administratorių paskyrų informaciją, kai paskyra sukuriama.',
          'Techninius duomenis, pvz., naršyklės tipą, įrenginio informaciją, aplankytus puslapius ir saugumo žurnalus.',
        ],
      },
      {
        title: 'Kaip naudojame informaciją',
        items: [
          'Rezervacijoms kurti, patvirtinti, valdyti ir rodyti klientų bei administratoriaus skydeliuose.',
          'Paslaugoms, kainoms, specialistams, darbo valandoms, galerijai ir nuomos paraiškoms valdyti.',
          'Susisiekti dėl vizitų, nuomos paraiškų, paskyros veiklos arba paslaugų pakeitimų.',
          'Svetainei tobulinti, paskyroms apsaugoti, piktnaudžiavimui užkirsti kelią ir veiklos įrašams tvarkyti.',
          'Vykdyti teisines, mokesčių, apskaitos ir vartotojų apsaugos pareigas, kai jos taikomos.',
        ],
      },
      {
        title: 'Kas gali pasiekti jūsų informaciją',
        body: 'Afroglow administratoriai gali matyti veiklai reikalingą informaciją, kad galėtų valdyti saloną, rezervacijas ir padėti klientams bei specialistams. Specialistai gali matyti tik su jų vizitais susijusią rezervacijų informaciją. Asmens duomenų neparduodame.',
      },
      {
        title: 'Kiek laiko saugome duomenis',
        body: 'Asmens duomenis saugome tik tiek, kiek reikia tikslui, kuriam jie buvo surinkti, įskaitant rezervacijas, klientų aptarnavimą, teisines pareigas, apskaitą, ginčų sprendimą ir platformos saugumą.',
      },
      {
        title: 'Jūsų pasirinkimai',
        items: [
          'Galite prašyti savo asmens duomenų kopijos.',
          'Galite prašyti pataisyti netikslią arba neišsamią informaciją.',
          'Galite prašyti ištrinti duomenis, kai jų nebereikia teisėtiems verslo ar teisiniams tikslams.',
          'Galite nesutikti su tam tikru duomenų tvarkymu arba prašyti apriboti duomenų naudojimą.',
        ],
      },
      {
        title: 'Saugumas',
        body: 'Taikome pagrįstas technines ir organizacines priemones asmens duomenims apsaugoti. Jokia internetinė paslauga nėra visiškai nerizikinga, todėl naudokite stiprius slaptažodžius ir susisiekite su mumis pastebėję įtartiną veiklą.',
      },
    ],
  },
}

export default function PrivacyPage() {
  return <LegalContentPage icon="privacy" copy={copy} />
}
