# 🐳 Instalação Manual do Docker no Droplet

Se o Docker não foi instalado automaticamente, siga estes passos:

## 1. Instalar Docker

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

# Adicionar repositório do Docker
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Atualizar lista de pacotes
apt update

# Instalar Docker CE
apt install -y docker-ce docker-ce-cli containerd.io

# Verificar instalação
docker --version
```

## 2. Instalar Docker Compose

```bash
# Baixar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
chmod +x /usr/local/bin/docker-compose

# Criar link simbólico
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verificar instalação
docker-compose --version
```

## 3. Configurar Docker

```bash
# Iniciar serviço do Docker
systemctl start docker

# Habilitar Docker na inicialização
systemctl enable docker

# Verificar status
systemctl status docker

# Testar Docker
docker run hello-world
```

## 4. Verificar Instalação

```bash
# Versões
docker --version
docker-compose --version

# Informações do sistema
docker info

# Testar container
docker run --rm hello-world
```

## 5. Permissões (se necessário)

```bash
# Adicionar usuário ao grupo docker (se não estiver usando root)
usermod -aG docker $USER

# Recarregar grupos
newgrp docker
```

## 6. Continuar com o Deploy

Após instalar o Docker, volte ao passo 7:

```bash
# Ir para o diretório do projeto
cd quiz-interativo

# Rodar aplicação
docker-compose up -d

# Verificar se está rodando
docker ps
```

## Troubleshooting

### Se docker-compose não funcionar:
```bash
# Alternativa usando docker compose (sem hífen)
docker compose up -d
```

### Se houver erro de permissão:
```bash
# Usar sudo
sudo docker-compose up -d
```

### Se houver problema com o build:
```bash
# Verificar logs
docker-compose logs

# Reconstruir
docker-compose up --build -d
```

## Script de Instalação Automática

Você também pode usar este script:

```bash
# Baixar e executar script oficial
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```
