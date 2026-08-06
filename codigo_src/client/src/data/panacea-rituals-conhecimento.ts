import type { PanaceaRitual } from "./panacea-rituals";

export const PANACEA_RITUALS_CONHECIMENTO: PanaceaRitual[] = [
  {
    "id": "ritual-panacea-01",
    "code": "01",
    "name": "Prontuário Esotérico",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução padrão\nAlcance toque\nAlvo 1 ser\nDuração cena\nResistência Vontade anula, apenas para alvo involuntário\nSigilos dourados percorrem o corpo do alvo e se organizam diante de seus olhos como um prontuário médico\nimpossível. No momento da conjuração, você descobre:\n• se o alvo está saudável, machucado ou morrendo;\n• quais condições visíveis ou perceptíveis ele está sofrendo;\n• se está afetado por uma doença, droga, veneno ou substância química;\n• se está sob efeito de alguma habilidade paranormal ou ritual;\n• o elemento de um efeito paranormal presente, caso exista.\nO ritual não revela valores numéricos, habilidades desconhecidas, Enigmas de Medo, imunidades ou a origem exata\nde um efeito.\nEnquanto o ritual durar, você recebe +5 em testes de Medicina e Ocultismo para examinar o alvo ou identificar efeitos\nque estejam agindo sobre ele.\nCaso existam vários efeitos desconhecidos, o mestre revela inicialmente apenas um deles. Novas informações\npodem exigir testes ou observação adicional.",
    "discente": "Discente (+2 PD): Muda o alcance para curto e o alvo para até cinco seres. Você identifica todos os efeitos,\ncondições, doenças, drogas e venenos atualmente detectáveis nos alvos. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Como Discente. Além disso, para cada alvo, você descobre sua resistência mais alta, sua\nresistência mais baixa e qualquer resistência ou imunidade a dano que esteja atualmente ativa. Requer 3º círculo e\nafinidade com Conhecimento.",
    "application": "O ritual teria sido desenvolvido em Durgā para avaliar cobaias e pacientes sem depender de exames\nconvencionais. Farmacoteurgos e Epidemiologistas conseguem utilizá-lo para escolher melhor seus\ntratamentos e sintomas."
  },
  {
    "id": "ritual-panacea-02",
    "code": "02",
    "name": "Backup Cognitivo",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução padrão\nAlcance toque\nAlvo 1 ser voluntário\nDuração cena\nVocê registra a condição mental atual do alvo em um conjunto de sigilos dourados que se fixa atrás de seus olhos. A\nconsciência registrada funciona como um ponto de restauração.\nNa primeira vez durante o efeito que o alvo falhar em um teste de Vontade, ele pode repetir o teste. O segundo\nresultado deve ser utilizado, mesmo que seja pior.\nApós a repetição, o ritual termina.\nO backup não armazena lembranças completas, não impede perda de Sanidade e não recupera memórias alteradas\nou apagadas. Ele apenas tenta restaurar a estabilidade mental registrada no momento da conjuração.",
    "discente": "Discente (+2 PD): Muda o alcance para curto e o alvo para até cinco seres voluntários. O ritual termina\nindividualmente para cada alvo quando seu backup for utilizado. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Quando o backup for ativado, o alvo é considerado automaticamente bem-sucedido no teste\nde Vontade. Além disso, pode encerrar uma condição entre abalado, apavorado, esmorecido, fascinado, frustrado\nou pasmo que tenha sido causada pelo efeito resistido. Requer 3º círculo e afinidade com Conhecimento.",
    "application": "Maximón registra a mente como informação. Durgā trata o mesmo fenômeno como uma estabilização\nneuroquímica. As duas unidades discordam apenas sobre qual delas inventou o procedimento."
  },
  {
    "id": "ritual-panacea-03",
    "code": "03",
    "name": "Etiqueta de Ativo",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 ser\nDuração cena\nResistência Vontade anula\nUm número de identificação composto por sigilos aparece sobre o alvo. A etiqueta é invisível para todos, exceto você.\nEnquanto o alvo estiver em alcance longo, você:\n• sabe sua direção;\n• conhece sua distância aproximada;\n• recebe +5 em Percepção e Sobrevivência para encontrá-lo ou rastreá-lo;\n• reconhece imediatamente vestígios recentes deixados por ele.\nA etiqueta não fornece visão através de paredes, não permite atacar sem linha de efeito e não revela o espaço exato\ndo alvo. Invisibilidade, camuflagem e esconderijos continuam funcionando normalmente, mas não impedem que você\nsaiba a direção geral em que ele está.\nVocê só pode manter uma Etiqueta de Ativo por vez. Conjurar o ritual novamente encerra a etiqueta anterior.",
    "discente": "Discente (+2 PD): Ao conjurar o ritual, escolha até cinco aliados em alcance curto. Eles também conseguem\nperceber a etiqueta e recebem os benefícios do ritual. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alcance de rastreamento para extremo. Você e os aliados escolhidos sabem a\nposição exata do alvo e ele não recebe benefícios por estar escondido ou invisível contra vocês. Cobertura e\nbarreiras físicas ainda funcionam normalmente. Requer 3º círculo e afinidade com Conhecimento.",
    "application": "Em Hygieia, seres marcados recebem códigos de contenção. Para a equipe de recuperação, a etiqueta significa\nque o ativo ainda pertence à empresa - independentemente da opinião dele."
  },
  {
    "id": "ritual-panacea-04",
    "code": "04",
    "name": "Credencial Revogada",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução padrão\nAlcance curto\nEfeito barreira de sigilos com até 3m de comprimento\nDuração 1 rodada\nResistência Vontade anula\nEscolha um ser que possa perceber e trace uma linha de sigilos dourados sobre o chão, parede, porta ou passagem.\nSe o alvo falhar no teste de resistência, a mente dele passa a considerar aquela fronteira intransponível. Até o início\ndo seu próximo turno, ele não pode atravessar voluntariamente a linha.\nO alvo ainda pode:\n• atacar ou produzir efeitos através da linha;\n• ser empurrado ou carregado através dela;\n• ser teleportado involuntariamente;\n• contornar a barreira por um caminho que não a atravesse.\nA linha não é uma estrutura física e não impede a passagem de outros seres, objetos, projéteis ou efeitos.",
    "discente": "Discente (+2 PD): Muda a duração para sustentada e você pode escolher até cinco seres para serem afetados.\nCada um realiza seu próprio teste de resistência. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o efeito para uma barreira de até 9m de comprimento. Qualquer ser que você não\ntenha autorizado deve fazer um teste de Vontade sempre que tentar atravessá-la. Se falhar, seu movimento\ntermina diante da barreira. Um ser que passe fica imune ao ritual até o fim da cena. Requer 3º círculo e afinidade\ncom Conhecimento.",
    "application": "Hygieia não utiliza apenas portas, grades e campos eletromagnéticos. Algumas áreas permanecem fechadas\nporque os próprios funcionários são incapazes de conceber a possibilidade de entrar."
  },
  {
    "id": "ritual-panacea-05",
    "code": "05",
    "name": "Memória Orgânica",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução completa\nAlcance toque\nAlvo 1 ser vivo, cadáver ou amostra biológica\nDuração instantânea\nResistência Vontade anula, apenas para ser vivo involuntário\nVocê toca o alvo e transforma resíduos sensoriais armazenados em seu organismo em uma breve lembrança.\nEscolha um estímulo específico, como:\n• o último ser que feriu o alvo;\n• o último lugar onde sentiu medo;\n• o último alimento ou substância ingerida;\n• o momento em que contraiu uma doença;\n• a última manifestação paranormal que percebeu;\n• os instantes anteriores à sua morte.\nVocê recebe uma impressão de até seis segundos, formada por imagens, sons, cheiros, dor, temperatura e emoções\nque o alvo realmente tenha percebido.\nA memória:\n• não revela informações que o alvo não percebeu;\n• pode ser incompleta ou confusa;\n• não identifica automaticamente pessoas ou lugares desconhecidos;\n• não traduz idiomas;\n• não revela pensamentos ou conclusões;\n• não recupera lembranças destruídas pelo paranormal.\nEm plantas, fungos e organismos de Sumé, as impressões podem ser extremamente abstratas: luz, umidade,\nvibração, presença de sangue, calor ou alterações na Membrana.",
    "discente": "Discente (+2 PD): Você pode acessar uma memória de até um minuto ocorrida nas últimas 24 horas. Pode\ndescrever um acontecimento específico que procura, mas o ritual falha se o alvo não o tiver percebido. Requer 2º\ncírculo.",
    "verdadeira": "Verdadeiro (+5 PD): Pode acessar uma memória de até dez minutos ocorrida no último ano. Memórias reprimidas\nou esquecidas podem ser encontradas, mas memórias apagadas ou reescritas pelo paranormal aparecem apenas\ncomo espaços vazios cobertos por sigilos. Requer 3º círculo.",
    "application": "Sumé utiliza o ritual para entrevistar ecossistemas. Wohpe o utiliza para descobrir como uma doença entrou no\norganismo. Hygieia o utiliza nos cadáveres encontrados após uma quebra de contenção."
  },
  {
    "id": "ritual-panacea-06",
    "code": "06",
    "name": "Auditoria Residual",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução completa\nAlcance toque\nAlvo 1 objeto\nDuração instantânea\nVocê manifesta o último registro significativo deixado no objeto durante as últimas 24 horas.\nUma reprodução translúcida e silenciosa de aproximadamente seis segundos surge ao redor dele, revelando:\n• a aparência geral do último ser que o manipulou;\n• a maneira como o objeto foi utilizado;\n• há quanto tempo a interação aconteceu, de forma aproximada;\n• se o objeto foi aberto, disparado, escrito, quebrado, transportado, conectado, injetado ou alterado.\nO ritual revela apenas interações diretamente relacionadas ao objeto. Uma arma pode registrar quem a disparou, mas\nnão tudo o que aconteceu no local. Uma chave pode registrar uma fechadura, mas não o conteúdo da sala.\nA reprodução não revela detalhes que não estavam fisicamente relacionados à interação, como pensamentos,\nnomes, senhas não digitadas ou conversas ocorridas longe do objeto.\nUm objeto carregado ou empunhado por um ser involuntário não pode ser alvo deste ritual.",
    "discente": "Discente (+2 PD): A auditoria pode buscar interações ocorridas nos últimos sete dias. A reprodução possui som e\npode mostrar até um minuto da interação. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Você pode descrever uma interação específica ocorrida no último ano. Se ela realmente\naconteceu, o ritual a reproduz por até cinco minutos. Até cinco seres escolhidos podem perceber a reprodução.\nRequer 3º círculo.",
    "application": "O setor jurídico chama isso de auditoria. O setor de segurança chama de análise forense. Funcionários mais\nantigos chamam de motivo para nunca tocar em nada sem luvas."
  },
  {
    "id": "ritual-panacea-07",
    "code": "07",
    "name": "Termo de Confidencialidade",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 pessoa\nDuração cena\nResistência Vontade anula\nVocê pronuncia uma informação específica, expressa em uma única frase, que seja conhecida por você e pelo alvo.\nSe falhar no teste de resistência, o alvo se torna incapaz de comunicar deliberadamente essa informação. Sempre\nque tentar revelá-la:\n• suas palavras são substituídas por ruído e sussurros;\n• textos ficam cobertos por tarjas douradas;\n• gestos se tornam contraditórios;\n• gravações apresentam falhas;\n• transmissões digitais exibem mensagens de erro;\n• tentativas telepáticas transmitem apenas sigilos incompreensíveis.\nO alvo continua se lembrando da informação e pode agir com base nela. O ritual não o impede de fugir, atacar,\nprocurar ajuda ou comunicar outras informações relacionadas.\nCom uma ação padrão, o alvo pode tentar novamente o teste de Vontade. Se passar, o ritual termina e ele pode\ncomunicar a informação normalmente.\nO ritual precisa delimitar uma informação específica. Expressões amplas como “tudo sobre a Panacea”, “todos os\nseus segredos” ou “qualquer coisa que você viu” não são válidas.",
    "discente": "Discente (+2 PD): Muda o alvo para 1 ser capaz de se comunicar e a duração para 1 dia. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alvo para até cinco pessoas. Em vez de apenas impedir a comunicação, o ritual\nsuprime temporariamente a lembrança da informação. As memórias retornam quando o ritual termina. Requer 3º\ncírculo e afinidade com Conhecimento.",
    "application": "Os contratos da Panacea possuem centenas de páginas. A parte realmente importante não é impressa em\npapel."
  },
  {
    "id": "ritual-panacea-08",
    "code": "08",
    "name": "Ponto Cego Operacional",
    "element": "conhecimento",
    "circle": 1,
    "basic": "CONHECIMENTO 1º CÍRCULO\nExecução padrão\nAlcance curto\nAlvo 1 pessoa\nDuração 1 rodada\nResistência Vontade anula\nEscolha um ser em alcance curto para ser ocultado da percepção do alvo.\nSe o alvo falhar no teste de resistência, até o início do seu próximo turno ele se torna incapaz de perceber\nconscientemente o ser escolhido. A mente do alvo apaga imagens, sons e outros sinais que confirmariam a presença\ndele.\nEnquanto estiver ocultado:\n• o alvo não pode escolhê-lo como alvo de ataques ou habilidades;\n• o alvo não pode realizar reações contra suas ações;\n• o alvo considera seu espaço aparentemente vazio;\n• o ser ocultado pode continuar sendo afetado por áreas e efeitos que não dependam de percepção direta.\nO ritual não torna o ser invisível para outras pessoas e não remove sua presença física. Se ele bloquear uma\npassagem, o alvo percebe que existe algum obstáculo, mas não consegue compreender o que é.\nSe o ser ocultado realizar uma ação hostil contra o alvo, o efeito termina após essa ação ser resolvida.",
    "discente": "Discente (+2 PD): Muda o alvo para 1 ser e a duração para sustentada. No fim de cada turno, o alvo pode repetir o\nteste de Vontade para encerrar o efeito. Requer 2º círculo.",
    "verdadeira": "Verdadeiro (+5 PD): Muda o alvo para seres escolhidos em alcance curto e permite ocultar até cinco seres. A\nduração permanece 1 rodada. Cada alvo realiza seu próprio teste de resistência. Requer 3º círculo e afinidade com\nConhecimento.",
    "application": "Maximón descobriu que é mais simples apagar uma pessoa da percepção de um segurança do que removê-la\nde todas as câmeras."
  }
];
