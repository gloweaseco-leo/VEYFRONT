import { permanentRedirect } from 'next/navigation'
/** The previous Services and Pricing pages are one buyer decision. Preserve old links. */
export default function Page(){ permanentRedirect('/pricing') }
