# 🔧 Troubleshooting - Não Consegue Adicionar Perguntas

## Problema Comum: PartyKit não conectado

Se a aplicação está rodando mas você não consegue adicionar perguntas, o problema geralmente é a conexão com o PartyKit.

## Diagnóstico

### 1. Verificar se o PartyKit foi deployado

```bash
# No servidor, verificar se o PartyKit está deployado
npx partykit list

# Ou verificar a conta PartyKit
npx partykit whoami
```

### 2. Verificar variáveis de ambiente

```bash
# Verificar se as variáveis estão corretas
cat .env.production
```

### 3. Verificar logs da aplicação

```bash
# Ver logs do container
docker logs quiz-interativo-app

# Ver logs em tempo real
docker logs -f quiz-interativo-app
```

## Soluções

### Solução 1: Configurar PartyKit corretamente

```bash
# 1. Fazer login no PartyKit
npx partykit login

# 2. Deploy do PartyKit
npx partykit deploy --name quiz-interativo

# 3. Anotar a URL gerada (exemplo):
# https://quiz-interativo.seuusuario.partykit.dev
```

### Solução 2: Atualizar variáveis de ambiente

```bash
# Editar arquivo de produção
nano .env.production

# Substituir pela URL real do seu PartyKit:
NODE_ENV=production
VITE_PARTYKIT_HOST=quiz-interativo.seuusuario.partykit.dev
VITE_PARTYKIT_PROTOCOL=https
```

### Solução 3: Reconstruir aplicação

```bash
# Parar containers
docker-compose down

# Reconstruir com as novas variáveis
docker-compose up --build -d

# Verificar se está rodando
docker ps
docker logs quiz-interativo-app
```

## Testes de Verificação

### 1. Testar conexão PartyKit

```bash
# Testar se o PartyKit está respondendo
curl https://quiz-interativo.seuusuario.partykit.dev

# Deve retornar uma resposta do servidor
```

### 2. Verificar aplicação no navegador

1. Acesse: `http://SEU-IP`
2. Abra o Console do Desenvolvedor (F12)
3. Procure por erros de conexão WebSocket

### 3. Testar funcionalidade

1. Criar uma nova sala
2. Tentar adicionar uma pergunta
3. Verificar se aparece na interface

## Comandos de Debug

```bash
# Ver todas as variáveis de ambiente do container
docker exec quiz-interativo-app env

# Verificar se o build incluiu as variáveis
docker exec quiz-interativo-app cat /usr/share/nginx/html/index.html | grep -i partykit

# Verificar logs detalhados
docker-compose logs --tail=50
```

## Passos para Resolver

Execute estes comandos na ordem:

```bash
# 1. Verificar PartyKit
npx partykit whoami
npx partykit list

# 2. Se não estiver deployado, fazer deploy
npx partykit deploy --name quiz-interativo

# 3. Copiar a URL gerada e editar .env.production
nano .env.production
# Substituir: VITE_PARTYKIT_HOST=SUA-URL-REAL.partykit.dev

# 4. Reconstruir aplicação
docker-compose down
docker-compose up --build -d

# 5. Verificar
docker ps
docker logs quiz-interativo-app
```

## URL de Exemplo

Se sua URL do PartyKit for:
`https://quiz-interativo.victorsmaniotto.partykit.dev`

Seu `.env.production` deve estar assim:
```bash
NODE_ENV=production
VITE_PARTYKIT_HOST=quiz-interativo.victorsmaniotto.partykit.dev
VITE_PARTYKIT_PROTOCOL=https
```

## Não Funciona Ainda?

Se ainda não funcionar, pode ser:

1. **Problema de CORS**: O PartyKit pode ter restrições de domínio
2. **Firewall**: Verificar se a porta 443 está aberta
3. **DNS**: Verificar se o domínio está resolvendo corretamente

### Teste Alternativo

```bash
# Testar sem SSL (temporário)
# Editar .env.production:
VITE_PARTYKIT_PROTOCOL=http

# Reconstruir
docker-compose down
docker-compose up --build -d
```

**Me diga qual erro aparece nos logs e te ajudo a resolver!**
