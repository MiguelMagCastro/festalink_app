// Popula o banco com dados de demonstração: um prestador com dois salões
// (grade de horários e um bloqueio) e um cliente. Use com a API no ar:
//   node scripts/seed.js
// O endereço da API pode ser ajustado por API_URL (padrão http://127.0.0.1:3000).

const BASE = process.env.API_URL || 'http://127.0.0.1:3000';

async function req(metodo, caminho, { token, corpo } = {}) {
  const resp = await fetch(BASE + caminho, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await resp.text();
  const dados = texto ? JSON.parse(texto) : null;
  return { status: resp.status, dados };
}

async function registrar(usuario) {
  const r = await req('POST', '/auth/registrar', { corpo: usuario });
  if (r.status >= 400 && r.status !== 409) {
    // 400/409 quando o e-mail já existe: seguimos para o login.
    if (!(r.dados && /existe|cadastrado/i.test(r.dados.error || ''))) {
      console.log(`registrar ${usuario.email}: ${r.status} ${JSON.stringify(r.dados)}`);
    }
  }
}

async function login(email, senha) {
  const r = await req('POST', '/auth/login', { corpo: { email, senha } });
  if (r.status !== 200) {
    throw new Error(`login ${email} falhou: ${r.status} ${JSON.stringify(r.dados)}`);
  }
  return r.dados.token;
}

async function main() {
  const prestador = {
    nome: 'Casa de Festas Aurora',
    email: 'prestador@festalink.com',
    senha: '123456',
    papel: 'prestador',
  };
  const cliente = {
    nome: 'Marina Cliente',
    email: 'cliente@festalink.com',
    senha: '123456',
    papel: 'cliente',
  };

  await registrar(prestador);
  await registrar(cliente);

  const token = await login(prestador.email, prestador.senha);

  const saloes = [
    {
      nome: 'Salão Aurora',
      descricao: 'Espaço amplo e iluminado, ideal para casamentos e formaturas.',
      endereco: 'Av. das Flores, 1200 - Belo Horizonte',
      capacidadeMax: 200,
      valorDiaria: 2500,
      areaM2: 320,
      temEstacionamento: true,
      temCozinha: true,
      permiteMusicaAoVivo: true,
      aceitaPets: false,
      regrasAdicionais: 'Encerramento do som às 23h. Limpeza inclusa.',
    },
    {
      nome: 'Espaço Jardim',
      descricao: 'Área externa com jardim para festas infantis e confraternizações.',
      endereco: 'Rua dos Ipês, 45 - Belo Horizonte',
      capacidadeMax: 80,
      valorDiaria: 1200,
      areaM2: 150,
      temEstacionamento: false,
      temCozinha: true,
      permiteMusicaAoVivo: false,
      aceitaPets: true,
      regrasAdicionais: 'Permitido buffet próprio.',
    },
  ];

  const horarios = [
    { diaSemana: 0, abreEm: '10:00', fechaEm: '18:00' },
    { diaSemana: 1, abreEm: '10:00', fechaEm: '23:00' },
    { diaSemana: 2, abreEm: '10:00', fechaEm: '23:00' },
    { diaSemana: 3, abreEm: '10:00', fechaEm: '23:00' },
    { diaSemana: 4, abreEm: '10:00', fechaEm: '23:00' },
    { diaSemana: 5, abreEm: '10:00', fechaEm: '23:59' },
    { diaSemana: 6, abreEm: '09:00', fechaEm: '23:59' },
  ];

  for (const dados of saloes) {
    const criado = await req('POST', '/saloes', { token, corpo: dados });
    if (criado.status !== 201) {
      console.log(`salão ${dados.nome}: ${criado.status} ${JSON.stringify(criado.dados)}`);
      continue;
    }
    const id = criado.dados.id;
    await req('PUT', `/saloes/${id}/horarios`, { token, corpo: { horarios } });
    await req('POST', `/saloes/${id}/bloqueios`, {
      token,
      corpo: {
        data: '2026-12-25',
        horaInicio: '00:00',
        horaFim: '23:59',
        motivo: 'Feriado de Natal',
      },
    });
    console.log(`Salão criado: ${dados.nome} (id ${id})`);
  }

  console.log('\nSeed concluído.');
  console.log('Cliente:   cliente@festalink.com / 123456');
  console.log('Prestador: prestador@festalink.com / 123456');
}

main().catch((err) => {
  console.error('Falha no seed:', err.message);
  process.exit(1);
});
