# Continuidade Onix — 12/09/2026

Fonte: manual de continuidade fornecido pelo proprietário, confrontado com a main.

A aplicação continua sendo Next.js/Supabase. O código em `codigo_src` importa a interface da raiz para manter compatibilidade com o serviço Render histórico sem duplicar componentes. Nenhum catálogo ou PDF deve entrar no repositório: conteúdo carregado exclusivamente do Supabase após autorização.

Render: npm install instala e compila quando RENDER=true. npm start inicia Next em 0.0.0.0 e respeita PORT. npm run dev encaminha para produção no Render. db:push é uma compatibilidade explícita sem mutações; não roda Drizzle nem acessa Neon. Não reutilizar credenciais antigas em novas integrações.

Permissões: mestre administra perícias, habilidades, poderes, rituais e itens amaldiçoados. Jogadores podem consultar e usar esses recursos, mas não editá-los. Armas e equipamentos continuam editáveis. O trigger onix_guard_fields aplica a mesma regra a gravações diretas na API e importações.

Acessos: não existe cadastro público de jogador. O mestre cria identificador, nome do personagem e senha inicial pelo painel. A Edge Function `manage-player-access` mantém a chave administrativa apenas no servidor e permite criar contas ou trocar senhas. O primeiro mestre ativa uma única vez o e-mail já autorizado em `members`.

Rolagens: `dice_rolls` registra perícias, rolagens livres e dano. Jogadores só inserem rolagens das próprias fichas; somente o mestre consulta o histórico. A tabela participa do Supabase Realtime para atualizar o painel da mesa sem polling.

A branch backup/antes-sistema-onix preserva o código antigo. Dados e retratos no Neon ainda não foram migrados. Não apagar o Neon.

Verificações de produção pendentes: ferramentas Render não estão expostas nesta sessão e não há CLI autenticada. Configurações citadas do serviço vêm do manual; não foram confirmadas por API nesta sessão. Validar o deploy automático do serviço existente após merge. Não declarar cadastro/e-mail/recuperação e CRUD pelo navegador como concluídos sem teste integral.
