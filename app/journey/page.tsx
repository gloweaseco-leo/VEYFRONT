import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {enabledP0} from '@/lib/p0-journey'
import {JourneyConsole} from '@/components/veyfront/p0-journey-console'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'VEYFRONT · Private Journey Resume',robots:{index:false,follow:false},referrer:'no-referrer'}
export default function Page(){if(!enabledP0())notFound();return <JourneyConsole/>}
