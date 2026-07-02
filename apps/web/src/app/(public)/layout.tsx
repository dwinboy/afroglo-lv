import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileBookingBar from '@/components/layout/MobileBookingBar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <MobileBookingBar />
      <Footer />
    </>
  )
}
