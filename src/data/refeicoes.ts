import type { Refeicao, OpcaoRefeicao, RefeicaoId } from '../domain/types'

export const REFEICOES: Refeicao[] = [
  {
    id: 'cafe',
    nome: 'Café da manhã',
    horario: '7h',
    opcoes: [
      {
        id: 'cafe-1',
        nome: 'Frutas com iogurte e aveia',
        descricao: '1 banana, 1 pote de iogurte natural e 2 col. sopa de aveia em flocos',
        kcal: 250,
        nivel: 1,
        foto: 'https://images.unsplash.com/photo-1635153513641-8f8d449b369b?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'cafe-2',
        nome: 'Pão francês com queijo e café',
        descricao: '1 pão francês, 2 fatias de queijo minas e 1 xícara de café com leite',
        kcal: 400,
        nivel: 2,
        foto: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'cafe-3',
        nome: 'Pão de queijo e suco de laranja',
        descricao: '3 unidades de pão de queijo e 1 copo de suco de laranja natural',
        kcal: 480,
        nivel: 3,
        foto: 'https://images.unsplash.com/photo-1559141680-d0bd7bc5af84?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'cafe-4',
        nome: 'Misto quente, bolo e achocolatado',
        descricao: '1 misto quente, 1 fatia de bolo de fubá e 1 copo de achocolatado',
        kcal: 650,
        nivel: 4,
        foto: 'https://images.unsplash.com/photo-1768966741319-0ab742d22eb8?w=640&h=480&fit=crop&q=70',
      },
    ],
  },
  {
    id: 'lanche_manha',
    nome: 'Lanche da manhã',
    horario: '10h',
    opcoes: [
      {
        id: 'lanche_manha-1',
        nome: 'Maçã com castanhas',
        descricao: '1 maçã média e 3 unidades de castanha-do-pará',
        kcal: 100,
        nivel: 1,
        foto: 'https://images.unsplash.com/photo-1630563451961-ac2ff27616ab?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'lanche_manha-2',
        nome: 'Barra de cereal e suco de uva',
        descricao: '1 barra de cereal e 1 copo de suco de uva integral',
        kcal: 180,
        nivel: 2,
        foto: 'https://images.unsplash.com/photo-1530816878870-4f4fe65f5946?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'lanche_manha-3',
        nome: 'Biscoito recheado e chá',
        descricao: '4 unidades de biscoito recheado de chocolate e 1 xícara de chá',
        kcal: 300,
        nivel: 3,
        foto: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'lanche_manha-4',
        nome: 'Salgado frito e refrigerante',
        descricao: '1 coxinha de frango e 1 lata de refrigerante',
        kcal: 500,
        nivel: 4,
        foto: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=640&h=480&fit=crop&q=70',
      },
    ],
  },
  {
    id: 'almoco',
    nome: 'Almoço',
    horario: '12h30',
    opcoes: [
      {
        id: 'almoco-1',
        nome: 'Salada com frango grelhado',
        descricao: '1 prato de salada verde, 100g de frango grelhado e 4 col. sopa de arroz integral',
        kcal: 500,
        nivel: 1,
        foto: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'almoco-2',
        nome: 'Arroz, feijão e carne com salada',
        descricao: '4 col. sopa de arroz, 2 col. sopa de feijão, 100g de carne bovina grelhada e salada',
        kcal: 700,
        nivel: 2,
        foto: 'https://images.unsplash.com/photo-1562525922-cde78e2119f9?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'almoco-3',
        nome: 'Feijoada com arroz e couve',
        descricao: '1 concha de feijoada, 4 col. sopa de arroz branco e couve refogada',
        kcal: 900,
        nivel: 3,
        foto: 'https://images.unsplash.com/photo-1609607285694-e283bd2ea9a0?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'almoco-4',
        nome: 'Pizza e refrigerante',
        descricao: '4 fatias de pizza de calabresa e 1 lata de refrigerante',
        kcal: 1300,
        nivel: 4,
        foto: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=640&h=480&fit=crop&q=70',
      },
    ],
  },
  {
    id: 'lanche_tarde',
    nome: 'Lanche da tarde',
    horario: '16h',
    opcoes: [
      {
        id: 'lanche_tarde-1',
        nome: 'Iogurte com granola',
        descricao: '1 pote de iogurte natural e 2 col. sopa de granola',
        kcal: 150,
        nivel: 1,
        foto: 'https://images.unsplash.com/photo-1633104060731-32143505bacc?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'lanche_tarde-2',
        nome: 'Sanduíche natural e suco',
        descricao: '1 sanduíche natural de peito de peru e 1 copo de suco de melancia',
        kcal: 280,
        nivel: 2,
        foto: 'https://images.unsplash.com/photo-1665931040985-88ceff0fd38e?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'lanche_tarde-3',
        nome: 'Pão de queijo e café com leite',
        descricao: '2 unidades de pão de queijo e 1 xícara de café com leite',
        kcal: 320,
        nivel: 3,
        foto: 'https://images.unsplash.com/photo-1751199592465-f142293a8cc6?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'lanche_tarde-4',
        nome: 'Açaí com granola e leite condensado',
        descricao: '1 tigela de açaí (500ml) com granola e leite condensado',
        kcal: 550,
        nivel: 4,
        foto: 'https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?w=640&h=480&fit=crop&q=70',
      },
    ],
  },
  {
    id: 'jantar',
    nome: 'Jantar',
    horario: '19h30',
    opcoes: [
      {
        id: 'jantar-1',
        nome: 'Sopa de legumes com frango',
        descricao: '1 prato de sopa de legumes com pedaços de frango desfiado',
        kcal: 300,
        nivel: 1,
        foto: 'https://images.unsplash.com/photo-1559561723-c3f4195835db?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'jantar-2',
        nome: 'Omelete com salada e pão',
        descricao: 'omelete de 2 ovos, salada verde e 1 fatia de pão integral',
        kcal: 450,
        nivel: 2,
        foto: 'https://images.unsplash.com/photo-1646753331463-3bc9565f9541?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'jantar-3',
        nome: 'Macarrão à bolonhesa',
        descricao: '1 prato de macarrão ao molho bolonhesa com queijo ralado',
        kcal: 750,
        nivel: 3,
        foto: 'https://images.unsplash.com/photo-1571175534150-72cd2b5a6039?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'jantar-4',
        nome: 'Hambúrguer com batata frita',
        descricao: '1 hambúrguer artesanal com queijo e 1 porção de batata frita',
        kcal: 1100,
        nivel: 4,
        foto: 'https://images.unsplash.com/photo-1627781962452-6b468257844b?w=640&h=480&fit=crop&q=70',
      },
    ],
  },
  {
    id: 'ceia',
    nome: 'Ceia',
    horario: '22h',
    opcoes: [
      {
        id: 'ceia-1',
        nome: 'Chá com bolacha',
        descricao: '1 xícara de chá e 3 bolachas de água e sal',
        kcal: 90,
        nivel: 1,
        foto: 'https://images.unsplash.com/photo-1737092684423-03ee785a6ff6?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'ceia-2',
        nome: 'Iogurte com mel',
        descricao: '1 pote de iogurte natural com 1 col. sopa de mel',
        kcal: 180,
        nivel: 2,
        foto: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'ceia-3',
        nome: 'Vitamina de banana',
        descricao: '1 copo de vitamina de banana com leite integral',
        kcal: 280,
        nivel: 3,
        foto: 'https://images.unsplash.com/photo-1542444592-e6880e286bb9?w=640&h=480&fit=crop&q=70',
      },
      {
        id: 'ceia-4',
        nome: 'Sanduíche misto e refrigerante',
        descricao: '1 sanduíche de presunto e queijo e 1 copo de refrigerante',
        kcal: 500,
        nivel: 4,
        foto: 'https://images.unsplash.com/photo-1714959503216-ebd6562e3a4c?w=640&h=480&fit=crop&q=70',
      },
    ],
  },
]

export function buscarOpcao(opcaoId: string): { refeicao: Refeicao; opcao: OpcaoRefeicao } | null {
  for (const refeicao of REFEICOES) {
    const opcao = refeicao.opcoes.find((o) => o.id === opcaoId)
    if (opcao) return { refeicao, opcao }
  }
  return null
}

export function buscarRefeicao(id: RefeicaoId): Refeicao {
  const refeicao = REFEICOES.find((r) => r.id === id)
  if (!refeicao) throw new Error(`Refeição não encontrada: ${id}`)
  return refeicao
}
