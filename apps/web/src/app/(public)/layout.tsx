import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileBookingBar from '@/components/layout/MobileBookingBar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {/* Bottom padding on mobile so the sticky booking bar never covers content */}
      <main className="pb-24 md:pb-0">{children}</main>
      <MobileBookingBar />
      <Footer />
    </>
  )
}
