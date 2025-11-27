# 服务器部署指南

本文档记录了在新服务器上部署此项目所需的所有步骤。

---

## 第一部分：以 Root 用户身份进行初始设置

请以 `root` 用户或有 `sudo` 权限的用户身份，执行以下命令。

### 1. 更新系统并安装 Git

*   **要做什么 (What to do):**
    ```bash
    # 更新系统包列表
    sudo apt update
    
    # 安装 git
    sudo apt install git -y
    ```

*   **为什么 (Why):**
    *   `apt update`: 确保我们能安装最新版本的软件包。
    *   `git`: 部署脚本需要使用 `git` 命令从 GitHub 拉取最新的代码。

### 2. 创建专门的部署用户 (`webapp`)

*   **要做什么 (What to do):**
    ```bash
    # 创建一个名为 webapp 的新用户
    sudo adduser webapp
    
    # （可选）将 webapp 用户添加到 sudo 组，使其在需要时能执行管理员命令
    sudo usermod -aG sudo webapp
    ```

*   **为什么 (Why):**
    出于安全考虑，不应该使用 `root` 用户来运行网站。创建一个权限受限的专用用户 (`webapp`)，万一你的网站应用出现安全漏洞，攻击者也只能获得 `webapp` 用户的权限，而不是整个服务器的最高权限，从而将风险降到最低。

### 3. 创建网站目录并授权

*   **要做什么 (What to do):**
    ```bash
    # 创建网站文件存放的目录
    sudo mkdir -p /var/www/portfolio-blog
    
    # 将这个目录的所有权交给 webapp 用户
    sudo chown -R webapp:webapp /var/www/portfolio-blog
    ```

*   **为什么 (Why):**
    这是存放网站代码的标准位置。将目录所有权交给 `webapp` 用户，是为了确保该用户在后续的自动部署过程中，有权限在这个目录里创建、修改和删除文件。

---

## 第二部分：以 `webapp` 用户身份完成剩余设置

现在，请切换到 `webapp` 用户，然后执行以下所有步骤。

```bash
sudo su webapp
cd ~
```

### 4. 配置 SSH 远程登录 (可选但推荐)

这一步是为了让你能从自己的电脑上，不输入密码，直接、安全地以 `webapp` 用户身份登录到服务器。

*   **要做什么 (What to do):**
    1.  **在你的本地电脑上** (不是服务器上!)，获取你的公钥。如果还没有，就生成一个。
        ```bash
        # 查看并复制公钥内容。如果文件不存在，请先用 ssh-keygen 生成
        cat ~/.ssh/id_rsa.pub
        ```
    2.  **回到服务器上**，确保你当前是 `webapp` 用户。创建 `authorized_keys` 文件并粘贴你的公钥。
        ```bash
        # 创建 .ssh 目录
        mkdir ~/.ssh
        
        # 使用编辑器（如 nano）打开文件，然后将你本地电脑的公钥粘贴进去并保存
        nano ~/.ssh/authorized_keys
        ```
    3.  **设置正确的文件权限**。这是保证 SSH 密钥登录正常工作的关键一步。
        ```bash
        chmod 700 ~/.ssh
        chmod 600 ~/.ssh/authorized_keys
        ```

*   **为什么 (Why):**
    *   **安全**: 禁用密码登录，只允许密钥登录，可以极大地提高服务器的安全性，有效防止暴力破解攻击。
    *   **方便**: 设置完成后，你可以通过 `ssh webapp@你的服务器IP` 直接登录，无需每次都输入密码。

### 5. 安装 Node.js 和 PM2

*   **要做什么 (What to do):**
    ```bash
    # 下载并运行 nvm 安装脚本
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # 让 nvm 命令在当前终端会话中生效
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # 安装 Node.js 版本 20
    nvm install 20
    
    # 将版本 20 设置为默认版本
    nvm use 20
    nvm alias default 20
    
    # 使用 npm 全局安装 pm2 (这将为 webapp 用户安装 pm2)
    npm install -g pm2
    ```

*   **为什么 (Why):**
    这些工具需要由将要运行应用的 `webapp` 用户自己来安装。
    *   **nvm/Node.js**: 为 `webapp` 用户提供 Node.js 运行环境。
    *   **PM2**: 为 `webapp` 用户安装进程管理器，以便后续可以通过该用户来启动、管理博客应用。

### 6. 设置 GitHub 部署密钥 (Deploy Key)

*   **要做什么 (What to do):**
    1.  **在服务器上为 `webapp` 用户生成 SSH 密钥** (如果提示输入，一路按回车即可):
        ```bash
        ssh-keygen -t rsa -b 4096 -C "server-deploy-key"
        ```
    2.  **查看并复制服务器的公钥**:
        ```bash
        cat ~/.ssh/id_rsa.pub
        ```
        复制所有输出的内容。
    3.  **在 GitHub 上添加公钥**:
        进入你的 GitHub 仓库 -> "Settings" -> "Deploy keys" -> "Add deploy key"。将复制的公钥粘贴进去，标题任意，**并勾选 "Allow write access"**。

*   **为什么 (Why):**
    这是为了在你的服务器和 GitHub 之间建立安全的信任关系。这样，部署脚本以 `webapp` 用户身份执行 `git` 命令时，GitHub 才知道这个请求是合法的、经过授权的。这与上一步的“远程登录”密钥不同，此密钥专用于机器（服务器）与服务（GitHub）之间的通信。

### 7. 克隆你的项目仓库

*   **要做什么 (What to do):**
    ```bash
    # 使用 SSH 地址克隆你的仓库到之前创建的目录
    git clone git@github.com:qijinhaocode/portfolio-blog.git /var/www/portfolio-blog
    ```
    *(请确保上面的仓库地址是正确的)*

*   **为什么 (Why):**
    这是在服务器上进行的**唯一一次手动代码拉取**。它会将你的项目完整地克隆到指定目录，并自动设置好 `git remote`，让这个目录从此“认识”你的 GitHub 仓库。未来的所有代码更新都将在这个目录里通过 `git pull` 自动完成。

---

## 第三部分：配置 GitHub Actions 通过 SSH 部署

这一部分在本地浏览器中完成，目标是让 GitHub Actions 使用服务器上的密钥进行 SSH 连接并拉取/部署代码。

### 8. 公钥放在哪里？私钥放哪里？

*   **服务器 / GitHub Deploy Key（公钥）**：
    * 将 `webapp` 用户生成的公钥 (`~/.ssh/id_rsa.pub`) 添加到 **GitHub 仓库 Settings -> Deploy keys**，勾选 “Allow write access”。
    * 同时保留该公钥在服务器的 `~/.ssh/authorized_keys`，这样来自 Actions 的 SSH 也能登录服务器。
*   **GitHub Actions Secret（私钥）**：
    * 将同一对密钥的私钥 (`~/.ssh/id_rsa`) 内容复制后，保存到仓库的 **Settings -> Secrets and variables -> Actions -> New repository secret**。建议名称：`SSH_KEY`。
    * 再添加几个必要的 Secrets：
        * `SSH_HOST`：服务器 IP 或域名
        * `SSH_USER`：登录用户名，例如 `webapp`
        * `SSH_PORT`：SSH 端口，默认 22

### 9. Workflow 示例（在 `.github/workflows/deploy.yml`）

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_KEY }}

      - name: Deploy
        run: |
          ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" <<'EOF'
          cd /var/www/portfolio-blog
          git pull origin main
          npm install
          npm run build
          pm2 restart portfolio-blog || pm2 start npm --name "portfolio-blog" -- start
          EOF
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_USER }}
          SSH_PORT: ${{ secrets.SSH_PORT }}
```

*根据自身情况调整分支名、部署目录和启动命令。*

---

## 第四部分：使用自定义域名通过 Nginx 反向代理

以下步骤假设应用在本机 `127.0.0.1:3000` 运行，可根据实际端口调整。

1) 安装 Nginx（Ubuntu/Debian）
```bash
sudo apt update && sudo apt install nginx -y
# 开放 80/443（如果使用 ufw）
sudo ufw allow 'Nginx Full'
```

2) 新建站点配置 `/etc/nginx/sites-available/yourdomain.conf`
```nginx
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
将 `yourdomain.com` 替换为你的域名，端口按需改动。 我的domain 是 qijinhao.com

3) 启用配置并重载 Nginx
```bash
sudo ln -s /etc/nginx/sites-available/qijinhao.com.conf/etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

4) DNS 解析
在域名 DNS 控制台添加 A 记录（`@` 和/或 `www`）指向服务器公网 IP，待生效后即可用域名访问，无需端口号。

5) 可选：开启 HTTPS（推荐）
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d qijinhao.com -d www.qijinhao.com
```
按提示完成证书申请与自动配置。Certbot 会设置自动续期。*** End Patch```कर्त
