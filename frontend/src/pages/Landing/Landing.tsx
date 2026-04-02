import { Link } from 'react-router-dom'
import { MapPin, Leaf, Shield, Users } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const STATS = [
  { valor: '2.400+', label: 'Pontos de coleta' },
  { valor: '18', label: 'Estados cobertos' },
  { valor: '120t', label: 'Medicamentos descartados corretamente' },
]

const PASSOS = [
  {
    icon: MapPin,
    titulo: 'Localize',
    descricao: 'Encontre o ponto de descarte mais próximo de você no mapa interativo.',
  },
  {
    icon: Leaf,
    titulo: 'Descarte',
    descricao: 'Leve seus medicamentos vencidos ou sem uso ao ponto indicado.',
  },
  {
    icon: Shield,
    titulo: 'Proteja',
    descricao: 'Contribua para um meio ambiente mais saudável e cumpra a legislação vigente.',
  },
]

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section
          id="hero"
          className="bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white py-20 px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm mb-6">
              <Leaf className="w-4 h-4" />
              Descarte responsável de medicamentos
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
              Descarte seus medicamentos
              <br />
              <span className="text-accent">do jeito certo</span>
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-10 max-w-2xl mx-auto">
              O EcoMed conecta você ao ponto de coleta correto para seus medicamentos vencidos ou sem
              uso. Simples, gratuito e responsável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/mapa"
                className="bg-accent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-500 transition-colors shadow-lg"
              >
                Encontrar Ponto de Coleta
              </Link>
              <Link
                to="/parceiro/cadastro-ponto"
                className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
              >
                Seja um Parceiro
              </Link>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="py-20 px-4 bg-bg">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold font-display text-center text-text mb-4">
              Como funciona
            </h2>
            <p className="text-text-muted text-center mb-12">
              Em 3 passos simples, você já contribui para um Brasil mais saudável.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PASSOS.map((passo, idx) => (
                <div
                  key={passo.titulo}
                  className="bg-surface rounded-2xl p-8 text-center shadow-sm border border-gray-100"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <passo.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-primary font-bold text-sm mb-2">Passo {idx + 1}</div>
                  <h3 className="text-xl font-bold font-display text-text mb-3">{passo.titulo}</h3>
                  <p className="text-text-muted">{passo.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impacto */}
        <section id="impacto" className="py-20 px-4 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-display mb-4">Nosso impacto</h2>
            <p className="text-green-100 mb-12">
              Juntos, estamos fazendo a diferença no descarte correto de medicamentos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-5xl font-bold font-display text-accent mb-2">
                    {stat.valor}
                  </div>
                  <div className="text-green-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quem somos */}
        <section id="equipe" className="py-20 px-4 bg-bg">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-display text-text mb-4">Quem somos</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              O EcoMed é um projeto criado para facilitar o descarte correto de medicamentos no
              Brasil, promovendo saúde pública e consciência ambiental por meio da tecnologia. Nossa
              missão é conectar cidadãos, farmácias e unidades de saúde em uma rede de descarte
              responsável.
            </p>
          </div>
        </section>

        {/* Contato / CTA */}
        <section id="contato" className="py-20 px-4 bg-primary-dark text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-display mb-4">Quer ser parceiro?</h2>
            <p className="text-green-200 mb-8">
              Farmácias, drogarias e unidades de saúde: cadastre seu ponto de coleta e apareça no
              mapa EcoMed.
            </p>
            <Link
              to="/parceiro/cadastro-ponto"
              className="bg-accent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-500 transition-colors inline-block"
            >
              Cadastrar Ponto de Coleta
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
