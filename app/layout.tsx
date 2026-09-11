import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Sistema Onix | Apocalypsis',description:'Central de fichas, inventário e registros de Ordem Paranormal.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR" className="dark"><body>{children}</body></html>;}
