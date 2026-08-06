import type { PanaceaRitual } from "./panacea-rituals";

export const PANACEA_RITUALS_ENERGIA: PanaceaRitual[] = [
  {
    "id": "ritual-panacea-09",
    "code": "09",
    "name": "Protocolo de Instabilidade Controlada",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance toque\nAlvo 1 ser voluntário\nDuração cena\nVocê introduz uma carga de Energia instável no organismo do alvo. Símbolos coloridos surgem sob a pele, alterando\nseu funcionamento de maneira imprevisível.\nNo início de cada turno do alvo, role 1d4. Ele recebe o efeito correspondente até o início do próximo turno dele:\n• 1 - Aceleração motora: +3m de deslocamento.\n• 2 - Refração defensiva: +2 na Defesa.\n• 3 - Sobrecarga muscular: +2 em testes de ataque.\n• 4 - Estabilização reativa: +2 em testes de resistência.\nUma nova manifestação substitui a anterior.\nO dado desse ritual não pode ser rolado novamente por habilidades que permitam repetir rolagens. A instabilidade é\nparte necessária de seu funcionamento.",
    "discente": "Discente (+2 PD): No início de cada turno, role 2d4 e escolha qual dos resultados será aplicado. Resultados\nrepetidos não se acumulam. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Você não precisa mais rolar. No início de cada turno do alvo, escolha uma manifestação. O\nbônus de deslocamento aumenta para +6m e os demais bônus aumentam para +5. Requer 3º círculo e afinidade\ncom Energia.",
    "application": "Durgā desenvolveu o protocolo como um composto neuroestimulante. Maximón afirma que o organismo não\nestá sendo estimulado: está alternando entre diferentes versões possíveis de si mesmo."
  },
  {
    "id": "ritual-panacea-10",
    "code": "10",
    "name": "Reinicialização Forçada",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 objeto eletrônico ou item tecnológico\nDuração 1 rodada\nVocê envia um pulso de Energia ao alvo, fazendo seus circuitos, mecanismos e sistemas retomarem\ntemporariamente o funcionamento.\nAté o início do seu próximo turno, o objeto pode funcionar mesmo que esteja:\n• sem uma fonte convencional de energia;\n• travado ou superaquecido;\n• desligado por uma interferência;\n• temporariamente quebrado por uma habilidade ou efeito;\n• com seus sistemas eletrônicos comprometidos.\nO ritual não reconstrói partes destruídas, não cria munição, combustível ou cargas e não restaura um objeto\ncompletamente destruído. Uma arma sem munição continua sem munição, e um computador sem seus componentes\nprincipais continua inutilizável.\nQuando o ritual termina, o objeto retorna ao estado anterior.",
    "discente": "Discente (+2 PD): Muda a duração para cena. Caso o objeto esteja quebrado, ele retorna ao estado anterior\nquando o ritual termina. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alvo para até cinco objetos tecnológicos em alcance médio e a duração para cena.\nOs objetos podem continuar funcionando sem fontes externas de energia durante o efeito. Requer 3º círculo e\nafinidade com Energia.",
    "application": "O protocolo é utilizado em instalações onde uma queda de energia pode abrir celas, interromper equipamentos\nde suporte vital ou apagar décadas de pesquisa. A Panacea nunca esclareceu de onde vem a energia utilizada\npelo ritual."
  },
  {
    "id": "ritual-panacea-11",
    "code": "11",
    "name": "Curto-Circuito Sináptico",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 ser\nDuração instantânea\nResistência Fortitude parcial\nVocê dispara uma descarga fina e irregular que atravessa o sistema nervoso do alvo.\nO alvo sofre 2d6 pontos de dano de eletricidade e não pode realizar reações até o início do próximo turno dele.\nSe passar no teste de resistência, sofre metade do dano e evita a perda de reações.\nObjetos eletrônicos atingidos por este ritual sofrem o dobro de dano, mas não são afetados pela condição.",
    "discente": "Discente (+2 PD): Aumenta o dano para 4d6. Se falhar na resistência, o alvo também fica lento por uma rodada.\nRequer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alvo para seres escolhidos em alcance curto e o dano para 6d6 de Energia. Os alvos\nque falharem não podem realizar reações por uma rodada. Requer 3º círculo e afinidade com Energia.",
    "application": "Wohpe utiliza o ritual para estudar falhas neurológicas induzidas. Durgā o classifica como um método de\n“interrupção motora não invasiva”. Os pacientes discordam da parte “não invasiva”."
  },
  {
    "id": "ritual-panacea-12",
    "code": "12",
    "name": "Expulsão Vetorial",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 ser ou objeto de até 5 espaços\nDuração instantânea\nResistência Reflexos anula\nVocê altera abruptamente a direção das forças ao redor do alvo.\nEscolha entre atrair ou repelir. O alvo é movido até 4,5m em linha reta em sua direção ou na direção oposta.\nUm ser voluntário pode falhar automaticamente no teste de resistência.\nO movimento:\n• não provoca reações;\n• não pode fazer o alvo atravessar barreiras sólidas;\n• termina no último espaço desocupado disponível;\n• não permite mover o alvo verticalmente;\n• não causa dano por si só.\nSe o alvo colidir com uma barreira antes de completar o movimento, ele sofre 1d6 pontos de dano de impacto e o\nmovimento termina.\nUm objeto empunhado ou carregado utiliza o teste de Reflexos de seu portador.",
    "discente": "Discente (+2 PD): Muda o alvo para até cinco seres ou objetos, somando no máximo 10 espaços. A distância\naumenta para 6m. Cada alvo pode ser atraído ou repelido separadamente. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda a área para um cone de 9m. Seres e objetos escolhidos na área são repelidos em até\n9m e ficam caídos se falharem na resistência. Requer 3º círculo e afinidade com Energia.",
    "application": "Hygieia utiliza campos vetoriais para afastar funcionários de celas abertas, retirar seres de corredores e\nreposicionar espécimes sem contato físico. Documentos internos proíbem o uso do protocolo próximo a janelas."
  },
  {
    "id": "ritual-panacea-13",
    "code": "13",
    "name": "Holograma de Substituição",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 ser voluntário\nDuração cena\nVocê cria uma cópia holográfica do alvo. A imagem acompanha seus movimentos com pequenos atrasos, mudanças\nde cor e erros anatômicos difíceis de acompanhar durante um confronto.\nO alvo recebe +4 na Defesa.\nApós um ataque contra ele errar, o holograma é destruído e o ritual termina. O ataque não precisa ter errado\nespecificamente por causa do bônus.\nUm atacante precisa ser capaz de perceber o holograma para ser confundido. O bônus não se aplica contra efeitos\nem área ou ataques que não dependam de percepção.",
    "discente": "Discente (+2 PD): Cria três hologramas. O alvo recebe +6 na Defesa. Sempre que um ataque errar, um holograma\ndesaparece e o bônus diminui em 2. O ritual termina quando todas as cópias forem destruídas. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alvo para até cinco seres voluntários em alcance curto. Cada alvo recebe três\nhologramas e +6 na Defesa, seguindo as mesmas regras da versão Discente. Requer 3º círculo e afinidade com\nEnergia.",
    "application": "Maximón desenvolveu os hologramas para substituir funcionários em gravações de segurança. A aplicação\ndefensiva surgiu depois que uma cópia foi atacada por engano durante uma quebra de contenção."
  },
  {
    "id": "ritual-panacea-14",
    "code": "14",
    "name": "Campo de Ruído Branco",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance curto\nÁrea esfera com 3m de raio\nDuração sustentada\nVocê cria uma esfera de interferência audiovisual preenchida por estática, luzes fragmentadas, ruídos eletrônicos e\nimagens desconexas.\nEnquanto permanecerem na área:\n• seres possuem camuflagem;\n• câmeras e microfones não conseguem produzir registros compreensíveis;\n• comunicações sem fio são interrompidas;\n• sensores eletrônicos não conseguem detectar ou identificar alvos;\n• aparelhos eletrônicos continuam funcionando localmente, mas não podem transmitir informações para fora da área.\nO campo afeta aliados e inimigos igualmente.\nEle não impede a visão completamente e não bloqueia sinais mundanos transmitidos através de cabos físicos que\natravessem a área.",
    "discente": "Discente (+2 PD): Aumenta o raio para 6m. Ao conjurar, escolha um número de aparelhos igual à sua Presença.\nEsses aparelhos funcionam e transmitem normalmente dentro do campo. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda a duração para cena e não precisa ser sustentado. Você também pode escolher seres\nque não sofrem os efeitos da camuflagem criada pelo campo. Requer 3º círculo e afinidade com Energia.",
    "application": "A equipe de Maximón utiliza esse ritual quando deseja impedir transmissões, gravações e pedidos de socorro.\nO departamento de relações públicas o chama de zona de privacidade operacional."
  },
  {
    "id": "ritual-panacea-15",
    "code": "15",
    "name": "Bloqueio de Frequência",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 arma de fogo, acessório ou objeto eletrônico\nDuração 1 rodada\nResistência Reflexos anula, veja o texto\nVocê projeta um símbolo de interferência sobre o alvo. Até o início do seu próximo turno, o objeto para de funcionar.\nConforme o tipo de objeto:\n• uma arma de fogo não pode disparar;\n• um acessório deixa de fornecer seus benefícios;\n• um aparelho eletrônico desliga;\n• uma câmera para de registrar;\n• uma fechadura eletrônica permanece no estado em que estava;\n• um veículo não pode ser ligado ou controlado eletronicamente.\nO objeto não é danificado e volta a funcionar quando o ritual termina.\nSe estiver sendo empunhado, vestido ou carregado por um ser involuntário, ele pode fazer um teste de Reflexos para\nanular o ritual.\nObjetos puramente mecânicos e armas sem componentes tecnológicos não são afetados.",
    "discente": "Discente (+2 PD): Muda a duração para cena. No fim de cada turno, o portador pode repetir o teste de Reflexos\npara encerrar o efeito. Um objeto abandonado permanece bloqueado até o fim da cena. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alvo para todos os objetos eletrônicos em uma esfera de 6m de raio em alcance\nmédio. Objetos carregados recebem o teste de Reflexos normalmente. Você pode escolher objetos que não serão\nafetados. Requer 3º círculo e afinidade com Energia.",
    "application": "O ritual foi desenvolvido para neutralizar armas, alarmes, transmissores, veículos e sistemas roubados durante\nfugas de cobaias. Alguns funcionários descobriram que ele também desliga máquinas de café. Esses\nfuncionários desapareceram."
  },
  {
    "id": "ritual-panacea-16",
    "code": "16",
    "name": "Película Galvânica",
    "element": "energia",
    "circle": 1,
    "basic": "ENERGIA 1º CÍRCULO\nExecução padrão\nAlcance toque\nAlvo 1 ser voluntário\nDuração cena\nUma película translúcida e condutora cobre o corpo do alvo. Pequenos arcos elétricos percorrem sua pele, roupas e\nequipamentos sem feri-lo.\nO alvo recebe resistência 2 contra eletricidade.\nAlém disso, na primeira vez em cada rodada que for atingido por um ataque corpo a corpo, o atacante sofre 1d6\npontos de dano de eletricidade.\nO atacante precisa estar em alcance curto do alvo no momento da descarga. Ataques realizados por armas com\nalcance maior que curto não ativam o efeito.",
    "discente": "Discente (+2 PD): Aumenta a resistência para 5 e o dano da descarga para 2d6. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Aumenta a resistência para 10 e o dano para 3d6. Quando a película descarrega, você pode\nfazer com que a corrente salte para outro ser hostil em alcance curto do atacante, que sofre 3d6 de dano de\neletricidade. Reflexos reduz esse dano à metade. Requer 3º círculo e afinidade com Energia.",
    "application": "Durgā desenvolveu a película para proteger operadores de equipamentos experimentais. Sumé adaptou a\nfórmula para organismos capazes de armazenar eletricidade em tecidos vivos. Em alguns pacientes, a película\ncontinuou ativa mesmo após o ritual terminar."
  }
];
