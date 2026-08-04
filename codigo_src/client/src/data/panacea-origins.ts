import type { PanaceaOrigin } from "./panacea-types";

export const PANACEA_ORIGINS: PanaceaOrigin[] = [
  {
    "id": "tecnico-de-manutencao",
    "name": "Técnico de Manutenção",
    "description": "Você consertava sistemas elétricos, climatização, portas de segurança e equipamentos laboratoriais. Algumas máquinas continuavam funcionando mesmo quando estavam desconectadas da energia.",
    "trainedSkills": ["Profissão (técnico)", "Tecnologia"],
    "abilityName": "Bypass Manual",
    "abilityDescription": "Quando faz um teste para reparar, desativar ou operar uma máquina, porta ou sistema eletrônico, você pode gastar 2 PD para receber +5 no teste. Se passar, o tempo necessário para executar a tarefa é reduzido em uma etapa, com o mínimo de uma ação padrão.",
    "affinity": ["especialista"]
  },
  {
    "id": "agente-de-biosseguranca",
    "name": "Agente de Biossegurança",
    "description": "Você fiscalizava protocolos de descontaminação, equipamentos protetores e circulação de materiais perigosos. Oficialmente, os riscos eram químicos e biológicos. Os trajes reforçados contavam outra história.",
    "trainedSkills": ["Fortitude", "Reflexos"],
    "abilityName": "Protocolo de Descontaminação",
    "abilityDescription": "Quando você ou um aliado adjacente faz um teste de resistência contra veneno, doença, gás, radiação ou contaminação ambiental, você pode gastar 2 PD e uma reação para conceder +5 nesse teste.",
    "affinity": ["combatente", "especialista"]
  },
  {
    "id": "operador-logistico",
    "name": "Operador Logístico",
    "description": "Você controlava estoques, entregas e transferência de materiais entre instalações. Algumas cargas não apareciam no sistema e exigiam veículos refrigerados, escolta armada e ausência total de perguntas.",
    "trainedSkills": ["Pilotagem", "Profissão"],
    "abilityName": "Material de Reserva",
    "abilityDescription": "Uma vez por missão, você pode gastar uma ação padrão para revelar que separou previamente um equipamento geral de categoria 0. O item deve ser plausível para a situação e permanece disponível até o fim da missão.",
    "affinity": ["especialista"]
  },
  {
    "id": "auditor-de-conformidade",
    "name": "Auditor de Conformidade",
    "description": "Você verificava documentos, inventários e procedimentos internos. Quanto mais investigava, mais encontrava funcionários inexistentes, despesas sem origem e projetos aprovados por departamentos que não constavam no organograma.",
    "trainedSkills": ["Investigação", "Intuição"],
    "abilityName": "Os Números Não Fecham",
    "abilityDescription": "Uma vez por cena, ao procurar contradições em documentos, depoimentos, inventários ou registros digitais, você pode gastar 1 PD para receber +5 no teste. Quando passa, além das informações normais, percebe qual elemento da situação parece mais inconsistente.",
    "affinity": ["especialista"]
  },
  {
    "id": "arquivista-clinico",
    "name": "Arquivista Clínico",
    "description": "Você organizava prontuários, resultados de exames e registros dos voluntários. Certos pacientes possuíam décadas de histórico médico sem terem envelhecido um único dia.",
    "trainedSkills": ["Atualidades", "Investigação"],
    "abilityName": "Registro Cruzado",
    "abilityDescription": "Uma vez por cena, após analisar registros, sintomas ou evidências durante pelo menos uma rodada, você pode gastar 1 PD para fazer ao mestre uma pergunta relacionada a exposições anteriores, sintomas conhecidos, tratamento registrado, comportamento recorrente ou ligação entre dois pacientes ou projetos. O mestre fornece uma informação verdadeira e útil, embora ela possa estar incompleta ou censurada.",
    "affinity": ["especialista", "ocultista"]
  },
  {
    "id": "recrutador-de-voluntarios",
    "name": "Recrutador de Voluntários",
    "description": "Você divulgava testes remunerados e entrevistava candidatos para pesquisas clínicas. Acreditava que ajudava pessoas com doenças incuráveis. Não sabia por que alguns voluntários nunca deixavam as instalações.",
    "trainedSkills": ["Diplomacia", "Enganação"],
    "abilityName": "Consentimento Informado",
    "abilityDescription": "Na primeira vez em cada cena que tenta convencer uma pessoa a cooperar voluntariamente, você pode gastar 1 PD para receber +5 no teste de Diplomacia ou Enganação. Esse poder não funciona se o alvo já souber que você pretende prejudicá-lo.",
    "affinity": ["especialista"]
  },
  {
    "id": "zelador-do-setor-restrito",
    "name": "Zelador do Setor Restrito",
    "description": "Você limpava corredores, laboratórios e salas que outros funcionários não podiam acessar. Conhecia portas de serviço, túneis técnicos e espaços que não apareciam nas plantas oficiais.",
    "trainedSkills": ["Furtividade", "Percepção"],
    "abilityName": "Rotas de Serviço",
    "abilityDescription": "Uma vez por cena dentro de uma construção, você pode gastar 1 PD para procurar uma passagem de manutenção, ponto cego, acesso secundário ou esconderijo. Você recebe +5 no próximo teste de Furtividade ou Percepção relacionado a atravessar ou explorar o local. Caso nenhuma rota semelhante exista, o mestre informa isso e o PD não é gasto.",
    "affinity": ["especialista"]
  },
  {
    "id": "coletor-de-campo",
    "name": "Coletor de Campo",
    "description": "Você recolhia tecidos, fluidos, plantas, sedimentos e outros materiais para análise. Algumas missões eram realizadas em áreas isoladas após supostos acidentes ambientais.",
    "trainedSkills": ["Ciências", "Sobrevivência"],
    "abilityName": "Amostra Relevante",
    "abilityDescription": "Quando passa em um teste para recolher uma amostra de uma criatura, objeto ou ambiente, você pode gastar 1 PD. Você ou um aliado recebe +5 no próximo teste de Ciências, Medicina ou Ocultismo feito para analisar o alvo da amostra até o fim da cena.",
    "affinity": ["especialista", "ocultista"]
  },
  {
    "id": "motorista-de-transporte-biologico",
    "name": "Motorista de Transporte Biológico",
    "description": "Você conduzia ambulâncias, veículos refrigerados ou caminhões blindados. Era instruído a jamais abrir a carga, mesmo quando alguma coisa começava a bater por dentro.",
    "trainedSkills": ["Pilotagem", "Reflexos"],
    "abilityName": "Entrega Prioritária",
    "abilityDescription": "Uma vez por cena, quando falha em um teste de Pilotagem ou Reflexos enquanto conduz ou protege um veículo, você pode gastar 2 PD para rolar novamente o teste e ficar com o melhor resultado. Além disso, você sempre sabe identificar a rota comum mais rápida até hospitais, laboratórios e instalações da Panacea.",
    "affinity": ["combatente", "especialista"]
  },
  {
    "id": "operador-de-vigilancia",
    "name": "Operador de Vigilância",
    "description": "Você acompanhava câmeras, sensores de movimento e sistemas biométricos. Frequentemente via pessoas entrando em salas das quais nunca saíam — enquanto o sistema insistia que não havia ninguém ali.",
    "trainedSkills": ["Percepção", "Tecnologia"],
    "abilityName": "Olhos em Todo Lugar",
    "abilityDescription": "Quando utiliza câmeras, sensores, drones ou equipamentos de vigilância, você pode gastar 1 PD para receber +5 no teste de Percepção ou Tecnologia. Uma vez por cena, ao passar nesse teste, você também identifica um ponto cego, uma falha no sistema ou uma movimentação suspeita.",
    "affinity": ["especialista"]
  },
  {
    "id": "seguranca-de-instalacoes",
    "name": "Segurança de Instalações",
    "description": "Você trabalhava protegendo laboratórios, depósitos ou setores restritos. Os treinamentos mencionavam vazamentos químicos, espionagem industrial e ataques terroristas, mas alguns protocolos pareciam feitos para ameaças muito diferentes.",
    "trainedSkills": ["Fortitude", "Pontaria"],
    "abilityName": "Protocolo de Proteção",
    "abilityDescription": "Uma vez por rodada, quando um aliado adjacente sofre dano, você pode gastar 2 PD e uma reação para reduzir esse dano em 1d6 + seu Vigor.",
    "affinity": ["combatente"]
  },
  {
    "id": "operador-de-recuperacao",
    "name": "Operador de Recuperação",
    "description": "Você integrava uma equipe de resgate, evacuação ou busca em áreas perigosas. Era treinado para retirar funcionários de ambientes contaminados, mesmo quando os mapas e sensores deixavam de funcionar.",
    "trainedSkills": ["Atletismo", "Sobrevivência"],
    "abilityName": "Extração de Emergência",
    "abilityDescription": "Quando se desloca em direção a um aliado machucado ou morrendo, ou tenta sair de uma área perigosa, você pode gastar 1 PD para receber +3m de deslocamento e ignorar terreno difícil até o fim do turno.",
    "affinity": ["combatente", "especialista"]
  },
  {
    "id": "analista-de-sistemas",
    "name": "Analista de Sistemas",
    "description": "Você administrava redes, câmeras, bancos de dados e sistemas de segurança da Panacea. Algumas partes da infraestrutura pareciam funcionar sem conexão elétrica ou apresentavam registros anteriores à construção da instalação.",
    "trainedSkills": ["Investigação", "Tecnologia"],
    "abilityName": "Acesso de Serviço",
    "abilityDescription": "Uma vez por cena, quando interage com um terminal, fechadura eletrônica, câmera, banco de dados ou dispositivo semelhante, você pode gastar 1 PD para receber +5 no teste. O tempo necessário para realizar a tarefa é reduzido em uma etapa, de horas para minutos ou de minutos para rodadas, com o mínimo de uma ação padrão.",
    "affinity": ["especialista"]
  },
  {
    "id": "pesquisador-biomedico",
    "name": "Pesquisador Biomédico",
    "description": "Você trabalhava com medicamentos, tecidos, tratamentos experimentais ou análise de organismos. Certas amostras apresentavam estruturas impossíveis, mas seus superiores sempre atribuíam isso a erros de armazenamento.",
    "trainedSkills": ["Ciências", "Medicina"],
    "abilityName": "Dose de Contingência",
    "abilityDescription": "No início de cada missão, você recebe duas doses experimentais. Com uma ação padrão, pode aplicar uma dose em si mesmo ou em um aliado adjacente. O alvo recebe 1d6 + seu Intelecto em PV temporários e +2 em Fortitude até o início do próximo turno. Uma mesma pessoa só pode receber uma dose por cena.",
    "affinity": ["especialista", "ocultista"]
  },
  {
    "id": "coordenador-de-projetos",
    "name": "Coordenador de Projetos",
    "description": "Você organizava equipes, prazos e operações entre diferentes departamentos. Aprendeu a manter todos funcionando mesmo durante apagões, evacuações e incidentes que nunca apareciam nos relatórios oficiais.",
    "trainedSkills": ["Diplomacia", "Profissão"],
    "abilityName": "Cadeia de Comando",
    "abilityDescription": "Uma vez por cena, você pode gastar uma ação de movimento e 2 PD para orientar um aliado em alcance curto que possa ouvi-lo. O aliado escolhe entre mover-se imediatamente até 3m ou receber +5 no próximo teste realizado antes do início do seu próximo turno.",
    "affinity": ["especialista", "combatente"]
  }
];
