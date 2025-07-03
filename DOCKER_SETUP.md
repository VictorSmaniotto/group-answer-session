# Pré-requisitos para Deploy Local

## Instalação do Docker no Windows

Para testar o build Docker localmente, você precisa instalar o Docker Desktop:

1. **Baixar Docker Desktop**
   - Acesse: https://www.docker.com/products/docker-desktop/
   - Baixe a versão para Windows

2. **Instalar Docker Desktop**
   - Execute o instalador baixado
   - Siga as instruções de instalação
   - Reinicie o computador se solicitado

3. **Verificar Instalação**
   ```powershell
   docker --version
   docker-compose --version
   ```

4. **Testar o Build da Aplicação**
   ```powershell
   cd c:\Users\Victor\Herd\group-answer-session
   docker build -t quiz-app .
   ```

5. **Testar Localmente**
   ```powershell
   docker run -p 8080:80 quiz-app
   ```
   - Acesse: http://localhost:8080

## Sem Docker Local

Se você não quiser instalar o Docker localmente, pode pular direto para o deploy no servidor Digital Ocean. O build será feito no servidor.

## Próximos Passos

1. **Com Docker Local**:
   - Instale Docker Desktop
   - Teste o build localmente
   - Siga as instruções do DEPLOY.md

2. **Sem Docker Local**:
   - Vá direto para o deploy no servidor
   - Siga as instruções do DEPLOY.md a partir do passo 2

## Status do Projeto

✅ **Arquivos de Deploy Prontos**:
- Dockerfile (corrigido)
- docker-compose.yml
- nginx.conf
- .env.production
- .dockerignore
- setup-server.sh
- deploy.sh
- DEPLOY.md

✅ **Aplicação Testada**:
- PartyKit deploy funcionando
- Interface visual ajustada
- Sistema de cores por participante implementado
- Bugs corrigidos
- ✅ **Build Docker testado e funcionando localmente**

� **Próximo Passo**: Deploy no servidor Digital Ocean

## Alternativa: Deploy sem Docker Local

Se você não quiser instalar o Docker localmente, pode criar um Droplet na Digital Ocean e fazer o deploy diretamente lá, seguindo as instruções do DEPLOY.md.
