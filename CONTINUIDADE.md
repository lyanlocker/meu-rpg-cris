# Continuidade Onix — 12/09/2026

Fonte: manual de continuidade fornecido pelo proprietário, confrontado com a main.

A aplicação continua sendo Next.js/Supabase. O código em codigo_src é uma cópia de compatibilidade com o serviço Render histórico que usa esse diretório. Ao alterar a interface, manter as duas cópias sincronizadas. Nenhum catálogo ou PDF deve entrar nessas cópias: conteúdo carregado exclusivamente do Supabase após autorização.

Render: npm install instala e compila quando RENDER=true. npm start inicia Next em 0.0.0.0 e respeita PORT. npm run dev encaminha para produção no Render. db:push é uma compatibilidade explícita sem mutações; não roda Drizzle nem acessa Neon. Não reutilizar credenciais antigas em novas integrações.

Permissões: mestre administra perícias, habilidades, poderes, rituais e itens amaldiçoados. Jogadores podem consultar e usar esses recursos, mas não editá-los. Armas e equipamentos continuam editáveis. O trigger onix_guard_fields aplica a mesma regra a gravações diretas na API e importações.

A branch backup/antes-sistema-onix preserva o código antigo. Dados e retratos no Neon ainda não foram migrados. Não apagar o Neon.

Verificações de produção pendentes: ferramentas Render não estão expostas nesta sessão e não há CLI autenticada. Configurações citadas do serviço vêm do manual; não foram confirmadas por API nesta sessão. Validar o deploy automático do serviço existente após merge. Não declarar cadastro/e-mail/recuperação e CRUD pelo navegador como concluídos sem teste integral.
