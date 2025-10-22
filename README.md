# App de Agendamento

Este é um aplicativo multiplataforma (Android, iOS e Web) para agendamento de sessões, construído com React Native (Expo) e Firebase. O projeto foi desenvolvido como parte de um processo de aprendizado intensivo, focado em criar uma aplicação completa, robusta e com fluxos de usuário realistas.

O aplicativo apresenta dois "lados" ou fluxos de usuário distintos:

1.  **Fluxo do Cliente:** Permite que pacientes se cadastrem, façam login, vejam horários disponíveis, agendem novas sessões, visualizem seu histórico e cancelem agendamentos futuros.
2.  **Fluxo do Profissional:** Permite que o profissional veja sua agenda diária, confirme quais pacientes foram atendidos, cancele agendamentos (com motivo) e bloqueie dias ou horários específicos.

## Recursos Principais

### Fluxo Comum e Autenticação

- **Tela de Carregamento:** Tela de entrada personalizada (`TelaCarregamento.js`) enquanto o app verifica o status de login.
- **Autenticação Segura:** Sistema de Login e Cadastro (`TelaLogin.js`, `TelaCadastro.js`) usando **Firebase Authentication** (E-mail/Senha) e telefone (caso queira) na `TelaCadastro.js`.
- **Feedback de Login:** Tela de sucesso personalizada (`"Login efetuado com sucesso!"`) que aparece antes da navegação principal.
- **Separação por Cargo:** O aplicativo detecta automaticamente (`AppNavegacao`) se o usuário logado é `cliente` ou `psicologo` (definido no Firestore) e o direciona para a interface correta.
- **Detecção Offline:** Um `Contexto` global (`ContextoConexao.js`) monitora a internet e desabilita botões de ação (como "Agendar", "Sair", etc.) se o usuário estiver offline, informando o status na tela.
- **Navegação Fluida:** Animações de slide horizontal (`CardStyleInterpolators`) entre as telas de Login e Cadastro.

### 👩‍⚕️ Funcionalidades do Profissional

- **Navegação por Abas:**
  - **Agenda do Dia (`TelaAgendaPsicologo.js`):** Visualiza todas as consultas do dia selecionado, ordenadas por hora.
  - **Bloquear (`TelaBloqueioHorarios.js`):** Interface para bloquear um dia inteiro ou horários individuais.
  - **Perfil (`TelaPerfil.js`):** Visualização de dados e botão de Sair.
- **Gestão de Consultas:**
  - **Confirmar Atendimento:** Marca uma consulta como `atendido: true`, mudando seu status visual.
  - **Cancelar Agendamento:** Um toque breve em um agendamento permite ao psicólogo cancelar uma consulta, abrindo um modal (`ModalMotivoCancelamento.js`) para inserir o **motivo do cancelamento**.
  - **Ver Detalhes do Cliente:** Um toque longo (`onLongPress`) em um agendamento exibe um alerta (`AlertaCustomizado.js`) com o nome, e-mail e telefone do cliente.

### 🙍‍♂️ Funcionalidades do Cliente

- **Navegação por Abas:**
  - **Agendar (`TelaAgendamento.js`):** Calendário interativo que mostra horários disponíveis em tempo real, consultando o Firestore para verificar agendamentos e bloqueios.
  - **Minha Agenda (`TelaMeusAgendamentos.js`):** Lista de consultas dividida em "Próximos Agendamentos" e "Histórico".
  - **Perfil (`TelaPerfil.js`):** Visualização de dados e botão de Sair.
- **Integração Nativa:**
  - **Adicionar ao Calendário:** Após agendar, o cliente pode adicionar o evento ao calendário nativo do celular (`expo-calendar`).
  - **Notificações Push:** O app agenda uma notificação push local (`expo-notifications`) de lembrete para 24 horas antes da consulta.
- **Gestão do Cliente:**
  - **Cancelar Agendamento:** O cliente pode cancelar seus próprios agendamentos futuros. O agendamento é marcado como `canceladoPor: 'cliente'`.
  - **Ver Motivo do Cancelamento:** Se o psicólogo cancelar uma consulta, o motivo aparece no histórico do cliente.
  - **Limpar Histórico:** Um botão permite ao cliente apagar todos os agendamentos passados ou cancelados do seu histórico.

### 🎨 Componentes Reutilizáveis

- **`InputPadrao`:** Componente de `TextInput` com lógica embutida para mostrar/esconder senha (ícone de olho).
- **`BotaoPrincipal` / `BotaoAlerta`:** Botões padronizados com feedback de `loading` (spinner) e estado `disabled`.
- **`AlertaCustomizado`:** Um componente de pop-up (Modal) totalmente estilizado, com botão 'X' e configuração dinâmica de botões de ação.

## 🛠️ Tecnologias Utilizadas

- **Framework:** React Native (com Expo SDK 51)
- **Linguagem:** JavaScript (ES6+)
- **Backend:** Google Firebase
  - **Firebase Authentication** (Autenticação por E-mail/Senha)
  - **Cloud Firestore** (Banco de dados NoSQL em tempo real)
- **Navegação:** React Navigation v6
  - `@react-navigation/stack` (Stack Navigator)
  - `@react-navigation/material-top-tabs` (Tab Navigator)
- **Gerenciamento de Estado:** React Hooks (`useState`, `useEffect`) e React Context API (`ContextoConexao`).
- **Bibliotecas de UI e Componentes:**
  - `react-native-calendars`
- **APIs Nativas e Módulos do Expo:**
  - `expo-notifications`
  - `expo-calendar`
  - `expo-system-ui`
  - `@react-native-community/netinfo`
- **Animação:**
  - `react-native-reanimated`

## ⚙️ Como Executar o Projeto

Para rodar este projeto, são necessários alguns passos de configuração cruciais, pois o banco de dados está no Firebase e as chaves de API foram omitidas do repositório.

### 1. Aviso de Segurança

O arquivo de configuração do Firebase (`configuracaoFirebase.js`), que contém as chaves de API secretas, **foi intencionalmente omitido** deste repositório usando o `.gitignore`.

### 2. Passos para Instalação

1.  **Clone o Repositório:**

    ```bash
    git clone https://github.com/ericksuzano/App-Agendamento.git
    cd App-Agendamento
    ```

2.  **Instale as Dependências:**

    - Rode o comando `npm install` na pasta raiz.

    ```bash
    npm install
    ```

3.  **Execute o Projeto:**
    - É altamente recomendado limpar o cache na primeira execução.
    ```bash
    npx expo start --clear
    ```
    - Pressione `w` para rodar na Web ou escaneie o QR Code com o app Expo Go no seu celular.

### 3. Guia de Teste (Obrigatório para Funcionar)

O banco de dados está vazio. Para testar os dois fluxos, você precisará criar os usuários e definir o cargo do profissional manualmente:

1.  **Crie o Usuário Profissional:**

    - Abra o app e crie uma nova conta (ex: `psicologo@email.com` / `senha123`).
    - Vá ao seu **Console do Firebase** > **Cloud Firestore** > Coleção `usuarios`.
    - Encontre o documento do usuário que você acabou de cadastrar.
    - Clique em "Adicionar campo" (Add field):
      - **Nome do campo:** `cargo`
      - **Tipo:** `string`
      - **Valor:** `psicologo`

2.  **Crie um Usuário Cliente:**

    - No app, faça "Sair" (se estiver logado).
    - Crie uma segunda conta (ex: `cliente@email.com` / `senha123`).
    - (O cargo `cliente` é adicionado automaticamente pelo código de cadastro).

3.  **Teste os Fluxos:**
    - Agora você pode fazer login com `psicologo@email.com` para ver a interface de gestão e com `cliente@email.com` para ver a interface de agendamento.
