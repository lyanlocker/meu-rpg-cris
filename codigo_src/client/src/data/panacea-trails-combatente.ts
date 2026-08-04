import type { PanaceaTrail } from "./panacea-types";

export const PANACEA_COMBATENTE_TRAILS: PanaceaTrail[] = [
  {
    "id": "agente-de-contencao-hygieia",
    "name": "Agente de Contenção Hygieia",
    "class": "combatente",
    "description": "Você recebeu treinamento específico para impedir fugas, controlar indivíduos anômalos e proteger instalações durante quebras de contenção. Para a Panacea, matar uma criatura rara representa desperdiçar décadas de pesquisa.",
    "milestones": [
      {
        "nex": 10,
        "name": "Imobilização imediata",
        "description": "Uma vez por rodada, após acertar um ataque corpo a corpo, você pode gastar 2 PD para realizar imediatamente uma manobra de agarrar, derrubar, desarmar ou empurrar contra o mesmo alvo.\n\nEssa manobra não exige outra ação, mas utiliza um novo teste de manobra normalmente.\n\nCaso use uma arma que possa causar dano não letal, você não sofre penalidade para utilizá-la dessa forma."
      },
      {
        "nex": 40,
        "name": "Barreira de segurança",
        "description": "Quando um aliado adjacente é atingido por um ataque, você pode gastar uma reação e 2 PD para se colocar no caminho.\n\nVocê se torna o alvo do ataque e recebe resistência 5 contra o dano causado por ele.\n\nAlém disso, criaturas agarradas por você sofrem –5 em ataques contra qualquer alvo que não seja você."
      },
      {
        "nex": 65,
        "name": "Cela móvel",
        "description": "Seu controle físico se torna quase impossível de romper.\n\nCriaturas agarradas por você:\n\n• sofrem –5 em testes para escapar;\n• não podem realizar reações;\n• não podem conjurar rituais que exijam gestos;\n• podem ser arrastadas por você sem reduzir seu deslocamento.\n\nVocê também pode utilizar armas de uma mão normalmente enquanto mantém uma criatura agarrada."
      },
      {
        "nex": 99,
        "name": "Protocolo de contenção absoluta",
        "description": "Uma vez por cena, você pode gastar 5 PD para ativar este protocolo até o fim da cena.\n\nEnquanto estiver ativo, uma vez por rodada, quando acerta um ataque corpo a corpo, pode realizar uma manobra contra o alvo sem gastar PD adicional.\n\nAlém disso, quando vence uma manobra por 5 ou mais, escolhe um efeito adicional:\n\n• causa 4d8 de dano de impacto;\n• deixa o alvo vulnerável por uma rodada;\n• impede que o alvo se desloque por uma rodada;\n• retira um item que ele esteja segurando."
      }
    ]
  },
  {
    "id": "artilheiro-farmacologico-durga",
    "name": "Artilheiro Farmacológico Durgā",
    "class": "combatente",
    "description": "Você utiliza cartuchos especiais contendo compostos derivados de substâncias anômalas. Oficialmente, eles são medicamentos experimentais. Na prática, são capazes de dissolver tecidos, paralisar membros ou congelar o sistema nervoso. A trilha é inspirada no papel de Durgā como principal centro de sintetização farmacológica da Panacea.",
    "milestones": [
      {
        "nex": 10,
        "name": "Cartuchos de ensaio",
        "description": "Uma vez por rodada, quando acerta um ataque com uma arma de fogo ou de disparo, pode gastar 2 PD para aplicar um dos compostos abaixo.\n\nComposto hemolítico\nO ataque causa +1d6 de dano químico.\n\nEsse dado adicional não é multiplicado em um acerto crítico.\n\nComposto criogênico\nO deslocamento do alvo é reduzido em –3m até o início do seu próximo turno.\n\nReduções provenientes de vários disparos não se acumulam.\n\nComposto neuroinibidor\nO alvo sofre –2 no próximo teste de ataque que realizar até o início do seu próximo turno."
      },
      {
        "nex": 40,
        "name": "Fórmula combinada",
        "description": "Ao utilizar Cartuchos de Ensaio, você pode gastar 4 PD, em vez de 2 PD, para aplicar dois compostos diferentes no mesmo ataque.\n\nOs compostos também são aprimorados:\n\n• o dano hemolítico aumenta para +2d6;\n• a redução criogênica aumenta para –6m;\n• a penalidade neuroinibidora aumenta para –5."
      },
      {
        "nex": 65,
        "name": "Saturação química",
        "description": "Quando atinge uma criatura que já tenha sido afetada por um de seus compostos desde o início do seu último turno, ela fica saturada.\n\nEscolha um dos efeitos abaixo:\n\n• sofre 3d8 de dano químico;\n• fica fraca por uma rodada;\n• fica vulnerável por uma rodada;\n• não pode realizar reações por uma rodada.\n\nA criatura pode fazer um teste de Fortitude contra sua DT de Agilidade para evitar o efeito. Você só pode provocar uma saturação por rodada."
      },
      {
        "nex": 99,
        "name": "Lote Zero",
        "description": "Uma vez por cena, após acertar um ataque à distância, você pode gastar 6 PD para romper um cartucho experimental de nível máximo.\n\nO alvo atingido e todas as criaturas em um raio de 6m sofrem 6d8 de dano químico, com direito a um teste de Reflexos contra sua DT de Agilidade para reduzir esse dano à metade.\n\nO alvo original do ataque não pode reduzir o dano e também sofre os efeitos dos três Cartuchos de Ensaio simultaneamente.\n\nO disparo costuma deixar névoa colorida, cristalização dos tecidos e sinais biológicos que nem mesmo os pesquisadores da Panacea conseguem explicar completamente."
      }
    ]
  },
  {
    "id": "quimera-da-titanomaquia",
    "name": "Quimera da Titanomaquia",
    "class": "combatente",
    "description": "Fragmentos de diferentes criaturas foram implantados em seu organismo. Seu corpo é uma colônia de tecidos incompatíveis, mantida viva por técnicas desenvolvidas a partir dos resultados do Projeto Titanomaquia. Você não utiliza medicamentos para imitar uma criatura. Existem partes delas dentro de você.",
    "milestones": [
      {
        "nex": 10,
        "name": "Enxerto instável",
        "description": "Com uma ação de movimento e 2 PD, escolha um dos enxertos abaixo. Ele permanece ativo até o fim da cena.\n\nApenas um enxerto pode permanecer ativo por vez.\n\nEnxerto de carapaça\nPlacas endurecidas crescem ao redor de seus órgãos.\nVocê recebe resistência 2 contra dano balístico, corte, impacto e perfuração.\n\nEnxerto predatório\nSuas mãos, dentes ou braços se transformam em armas naturais.\nVocê recebe uma arma natural que causa 1d8 de dano de corte ou perfuração, à sua escolha. Ela é uma arma simples, leve e ágil.\n\nEnxerto locomotor\nSeus membros se alongam ou novas articulações surgem em seu corpo.\nVocê recebe:\n\n• +3m de deslocamento;\n• deslocamento de escalada igual ao seu deslocamento terrestre;\n• +2 em Atletismo."
      },
      {
        "nex": 40,
        "name": "Compatibilidade cruzada",
        "description": "Você pode gastar 4 PD para ativar dois enxertos simultaneamente.\n\nSe fizer isso, os enxertos recebem os seguintes aprimoramentos:\n\n• Carapaça: a resistência aumenta para 5.\n• Predatório: o dano aumenta para 1d10 e a margem de ameaça torna-se 19.\n• Locomotor: o bônus de deslocamento aumenta para +6m e você ignora terreno difícil.\n\nAo fim da cena, faça um teste de Fortitude DT 20. Se falhar, fica fatigado até o próximo interlúdio."
      },
      {
        "nex": 65,
        "name": "Assimilação reativa",
        "description": "Quando sofre dano paranormal, você pode gastar uma reação e 3 PD para adaptar seus enxertos ao elemento que o feriu.\n\nVocê recebe resistência 10 contra esse elemento até o fim da cena.\n\nSó pode manter resistência contra um elemento por vez. Utilizar novamente esta habilidade substitui o elemento anterior."
      },
      {
        "nex": 99,
        "name": "Produto Alfa",
        "description": "Os três enxertos permanecem permanentemente ativos em suas formas aprimoradas, sem custo de PD e sem provocar fadiga.\n\nUma vez por cena, você também pode gastar 5 PD para entrar em um surto evolutivo até o fim do seu turno. Durante o surto:\n\n• recebe uma ação padrão adicional;\n• aumenta seu alcance corpo a corpo em 3m;\n• seus ataques naturais causam +3d8 de dano;\n• fica imune a efeitos de movimento e condições de paralisia.\n\nAo fim do turno, você perde 2d8 PV, ignorando qualquer resistência.\n\nDocumentos internos provavelmente não utilizariam mais seu nome. Apenas uma designação de produto."
      }
    ]
  },
  {
    "id": "recuperador-de-ativos",
    "name": "Recuperador de Ativos",
    "class": "combatente",
    "description": "A Panacea chama criaturas, cobaias, funcionários desertores e documentos roubados de ativos. Você foi treinado para encontrá-los, persegui-los e trazê-los de volta. Preferencialmente vivos.",
    "milestones": [
      {
        "nex": 10,
        "name": "Sinalizador biométrico",
        "description": "Com uma ação de movimento e 2 PD, escolha uma criatura visível em alcance médio como seu ativo prioritário. A marca permanece até o fim da cena.\n\nEnquanto ela estiver marcada:\n\n• você sabe sua direção e distância aproximada;\n• recebe +3m de deslocamento quando se aproxima dela;\n• causa +1d6 de dano no primeiro ataque que acertar contra ela em cada rodada;\n• recebe +5 em Percepção e Sobrevivência para encontrá-la ou persegui-la.\n\nVocê só pode manter um ativo marcado por vez."
      },
      {
        "nex": 40,
        "name": "Extração forçada",
        "description": "Quando acerta seu ativo prioritário, pode gastar 3 PD para acionar um cabo, arpão, dispositivo magnético ou técnica de deslocamento.\n\nEscolha um dos efeitos:\n\n• puxa o alvo até 3m em sua direção;\n• empurra o alvo até 3m;\n• desloca-se até um espaço adjacente ao alvo;\n• impede que ele realize reações por uma rodada.\n\nSe o alvo for duas ou mais categorias de tamanho maior que você, não pode movê-lo, mas ainda pode se deslocar até ele."
      },
      {
        "nex": 65,
        "name": "Interceptação",
        "description": "Quando seu ativo prioritário se desloca ou ataca outro personagem, você pode gastar uma reação e 3 PD para se mover até metade do seu deslocamento na direção dele.\n\nSe terminar esse movimento ao alcance do ativo, pode realizar um ataque ou uma manobra contra ele.\n\nVocê pode usar esta habilidade uma vez por rodada."
      },
      {
        "nex": 99,
        "name": "Sem direito a fuga",
        "description": "Uma vez por cena, você pode gastar 5 PD para aprimorar seu Sinalizador Biométrico até o fim da cena.\n\nContra o ativo marcado:\n\n• seu bônus de deslocamento aumenta para +6m;\n• seus ataques ignoram 10 pontos de resistência a dano;\n• você sempre sabe sua localização exata;\n• ele não pode ficar escondido ou desprevenido para você;\n• ele não pode realizar reações contra suas ações.\n\nQuando reduz o ativo a 0 PV, pode deixá-lo inconsciente e estável, independentemente do tipo de dano utilizado."
      }
    ]
  }
];
