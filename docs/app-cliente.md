# App cliente (Flutter)

O app cliente é o aplicativo móvel pelo qual a pessoa que procura um salão se cadastra, busca espaços, abre uma reserva e acompanha o andamento dela. Ele conversa apenas com a API REST entregue nas Sprints 1 e 2; não fala direto com o banco nem com o broker.

## Organização do código

O projeto fica em `apps/cliente` e segue uma separação em camadas inspirada na Clean Architecture, com as dependências sempre apontando de fora para dentro. A interface usa o padrão MVVM: cada tela observa um ViewModel (`ChangeNotifier`), que orquestra os casos de uso através dos repositórios.

```
lib/
  core/          configuração, cliente HTTP (Dio), erros e sessão
  domain/        entidades e interfaces de repositório (sem framework)
    entities/    Usuario, Salao, Horario, Bloqueio, Reserva, Avaliacao, DetalheSalao
    repositories/ contratos AuthRepository, SalaoRepository, ReservaRepository
  data/          implementação da camada externa
    datasources/ chamadas HTTP por recurso (auth, salões, reservas)
    repositories/ implementações que cumprem os contratos do domínio
  presentation/  interface
    viewmodels/  estado de cada tela (MVVM)
    screens/     login, cadastro, home, lista, detalhe, nova reserva, minhas reservas
    widgets/     componentes reaproveitados (chip de status, estado vazio)
```

A camada `presentation` depende de `domain`; a camada `data` implementa as interfaces de `domain`. O `domain` não importa Flutter nem pacotes de rede. A injeção de dependências é feita no `main.dart`, que monta o `ApiClient`, os repositórios e os ViewModels e os disponibiliza via `provider`.

## Comunicação com a API

Todas as chamadas passam por um único `ApiClient` baseado no Dio. Um interceptor injeta o cabeçalho `Authorization: Bearer <token>` quando há sessão ativa e as respostas de erro do backend (`{ "error": "..." }`) são convertidas em uma `ApiException` com mensagem pronta para a tela. O token JWT é guardado no aparelho com `shared_preferences` e restaurado na abertura do app.

O endereço da API fica em `core/config.dart`. O padrão é `http://10.0.2.2:3000`, que é como o emulador Android enxerga o `localhost` da máquina. Para rodar em aparelho físico, basta informar o IP da máquina na rede ao compilar:

```
flutter run --dart-define=API_BASE_URL=http://192.168.0.10:3000
```

## Telas

- **Login e Cadastro**: autenticam o cliente e guardam o token. O cadastro cria a conta com papel `cliente` e já entra no app.
- **Salões**: lista os salões disponíveis (`GET /saloes`) com busca por nome ou endereço.
- **Detalhe do salão**: reúne os dados do espaço, a grade de horários (`GET /saloes/:id/horarios`), as datas bloqueadas (`GET /saloes/:id/bloqueios`) e as avaliações (`GET /saloes/:id/avaliacoes`).
- **Nova reserva**: escolhe data e horário com validação local (data não passada e término depois do início) e envia o pedido (`POST /reservas`), tratando as respostas de conflito do backend.
- **Minhas reservas**: lista as reservas do cliente (`GET /reservas/minhas`) com o status atual e permite cancelar (`PATCH /reservas/:id/cancelar`).

## Atualização assíncrona de estado

Quando o prestador aprova ou recusa um pedido, o app precisa refletir isso sem o usuário fazer nada. O caminho usado é o polling REST, aceito explicitamente pelo enunciado para o app do cliente: a aba "Minhas reservas" consulta `GET /reservas/minhas` em um intervalo curto (8 segundos), além de atualizar quando o app volta do segundo plano e ao puxar a lista para baixo. Como o status vem do servidor, a mudança feita pelo prestador aparece sozinha na próxima consulta.

O polling é controlado pelo `ReservasViewModel`, que liga o `Timer` ao entrar na Home e o desliga ao sair ou quando o app vai para segundo plano.

## Como rodar

Com o backend no ar (veja o README) e um emulador ou aparelho conectado:

```
cd apps/cliente
flutter pub get
flutter run
```

Para gerar o APK:

```
flutter build apk --release
```

O arquivo sai em `apps/cliente/build/app/outputs/flutter-apk/app-release.apk`.
