const btnEmpresas = document.getElementById("btnEmpresas");
const btnSetores = document.getElementById("btnSetores");
const titulo = document.getElementById("titulo");
const listaContainer = document.getElementById("listaContainer");
const btnAdicionar = document.getElementById("btnAdicionar");

const modalEmpresa = document.getElementById("modalEmpresa");
const modalEmpresaTitulo = document.getElementById("modalEmpresaTitulo");
const formEmpresa = document.getElementById("formEmpresa");
const razaoSocialInput = document.getElementById("razaoSocial");
const nomeFantasiaInput = document.getElementById("nomeFantasia");
const cnpjInput = document.getElementById("cnpj");
const selectSetores = document.getElementById("selectSetores");
const btnAdicionarSetor = document.getElementById("btnAdicionarSetor");
const tagsSetores = document.getElementById("tagsSetores");
const btnCancelarEmpresa = document.getElementById("btnCancelarEmpresa");

const modalSetor = document.getElementById("modalSetor");
const modalSetorTitulo = document.getElementById("modalSetorTitulo");
const formSetor = document.getElementById("formSetor");
const descricaoSetorInput = document.getElementById("descricaoSetor");
const btnCancelarSetor = document.getElementById("btnCancelarSetor");

const modalConfirmar = document.getElementById("modalConfirmar");
const modalConfirmarTexto = document.getElementById("modalConfirmarTexto");
const btnConfirmarExcluir = document.getElementById("btnConfirmarExcluir");
const btnCancelarExcluir = document.getElementById("btnCancelarExcluir");

var empresas = [];
var setores = [];
var linhasPorPagina = 10;
var paginaAtual = 1;
const host = "http://localhost:3000/api";

async function buscarEmpresasESetores() {
  try {
    const [empresasRes, setoresRes] = await Promise.all([
      fetch(host + "/empresas"),
      fetch(host + "/setores"),
    ]);

    if (!empresasRes.ok || !setoresRes.ok) {
      throw new Error("Erro ao buscar dados da API");
    }

    empresas = await empresasRes.json();
    setores = await setoresRes.json();
    paginaAtual = 1;
    atualizarLista();
  } catch (err) {
    console.error("Erro ao buscar dados:", err.message);
  }
}

buscarEmpresasESetores();

let secaoAtual = "empresas";
let setoresSelecionados = [];
let empresaEditandoId = null;
let setorEditandoId = null;
let itemExcluir = null;

function atualizarLista(pagina = 1) {
  listaContainer.innerHTML = "";

  if (secaoAtual === "empresas") {
    const inicio = (pagina - 1) * linhasPorPagina;
    const fim = inicio + linhasPorPagina;
    titulo.textContent = "Empresas";

    if (empresas.length === 0) {
      listaContainer.innerHTML = "<p>Nenhuma empresa cadastrada.</p>";
      return;
    }

    const table = document.createElement("table");
    table.className = "table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Razão Social</th>
        <th>Nome Fantasia</th>
        <th>CNPJ</th>
        <th>Setores</th>
        <th>Ações</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const empresasPagina = empresas.slice(inicio, fim);

    empresasPagina.forEach((emp) => {
      const tr = document.createElement("tr");

      const setoresTexto = emp.setores
        .map((setor) => setor.descricao)
        .join(", ");

      tr.innerHTML = `
        <td>${emp.razao_social}</td>
        <td>${emp.nome_fantasia}</td>
        <td>${emp.cnpj}</td>
        <td>${setoresTexto}</td>
        <td>
          <button class="acao-btn btn-editar" data-id="${emp.id}" data-tipo="empresa">Editar</button>
          <button class="acao-btn btn-excluir" data-id="${emp.id}" data-tipo="empresa">Excluir</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    listaContainer.appendChild(table);
    renderizarPaginacao(empresas);
  } else if (secaoAtual === "setores") {
    titulo.textContent = "Setores";
    const inicio = (pagina - 1) * linhasPorPagina;
    const fim = inicio + linhasPorPagina;

    if (setores.length === 0) {
      listaContainer.innerHTML = "<p>Nenhum setor cadastrado.</p>";
      return;
    }
    const setoresPagina = setores.slice(inicio, fim);

    setoresPagina.forEach((setor) => {
      const div = document.createElement("div");
      div.className = "item-setor";
      div.innerHTML = `
        <span>${setor.descricao}</span>
        <div>
          <button class="acao-btn btn-editar" data-id="${setor.id}" data-tipo="setor">Editar</button>
          <button class="acao-btn btn-excluir" data-id="${setor.id}" data-tipo="setor">Excluir</button>
        </div>
      `;
      listaContainer.appendChild(div);
      renderizarPaginacao(setores);
    });
  }

  adicionarEventosAcoes();
}

function abrirModalEmpresa(editando = false, empresa = null) {
  setoresSelecionados = [];
  carregarSelectSetores();

  if (editando && empresa) {
    cnpjInput.disabled = true;
    modalEmpresaTitulo.textContent = "Editar Empresa";
    razaoSocialInput.value = empresa.razao_social;
    nomeFantasiaInput.value = empresa.nome_fantasia;
    cnpjInput.value = empresa.cnpj;
    setoresSelecionados = empresa.setores.map((setor) => setor.id);
    empresaEditandoId = empresa.id;
  } else {
    cnpjInput.disabled = false;
    modalEmpresaTitulo.textContent = "Adicionar Empresa";
    formEmpresa.reset();
    empresaEditandoId = null;
  }
  renderizarTags();
  modalEmpresa.style.display = "flex";
}

function renderizarTags() {
  tagsSetores.innerHTML = "";
  setoresSelecionados.forEach((idSetor) => {
    const setor = setores.find((s) => s.id === idSetor);
    if (!setor) return;

    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = setor.descricao;

    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-tag";
    removeBtn.textContent = "×";
    removeBtn.onclick = () => {
      setoresSelecionados = setoresSelecionados.filter((id) => id !== idSetor);
      renderizarTags();
    };

    span.appendChild(removeBtn);
    tagsSetores.appendChild(span);
  });
}

function carregarSelectSetores() {
  selectSetores.innerHTML = "";
  setores.forEach((setor) => {
    const option = document.createElement("option");
    option.value = setor.id;
    option.textContent = setor.descricao;
    selectSetores.appendChild(option);
  });
}

function abrirModalSetor(editando = false, setor = null) {
  if (editando && setor) {
    modalSetorTitulo.textContent = "Editar Setor";
    descricaoSetorInput.value = setor.descricao;
    setorEditandoId = setor.id;
  } else {
    modalSetorTitulo.textContent = "Adicionar Setor";
    formSetor.reset();
    setorEditandoId = null;
  }
  modalSetor.style.display = "flex";
}

function abrirModalConfirmacaoExclusao(event) {
  const btn = event.target;
  const id = parseInt(btn.getAttribute("data-id"));
  const tipo = btn.getAttribute("data-tipo");
  itemExcluir = { tipo, id };

  modalConfirmarTexto.textContent = `Deseja realmente excluir esta ${tipo}?`;
  modalConfirmar.style.display = "flex";
}

function fecharModalEmpresa() {
  modalEmpresa.style.display = "none";
  empresaEditandoId = null;
  setoresSelecionados = [];
}

function fecharModalSetor() {
  modalSetor.style.display = "none";
  setorEditandoId = null;
}

function fecharModalConfirmar() {
  modalConfirmar.style.display = "none";
  itemExcluir = null;
}

btnEmpresas.onclick = () => {
  secaoAtual = "empresas";
  titulo.textContent = "Empresas";
  buscarEmpresasESetores();
};

btnSetores.onclick = () => {
  secaoAtual = "setores";
  titulo.textContent = "Setores";
  buscarEmpresasESetores();
};

btnAdicionar.onclick = () => {
  if (secaoAtual === "empresas") {
    abrirModalEmpresa();
  } else {
    abrirModalSetor();
  }
};

btnCancelarEmpresa.onclick = fecharModalEmpresa;
btnCancelarSetor.onclick = fecharModalSetor;
btnCancelarExcluir.onclick = fecharModalConfirmar;

btnAdicionarSetor.onclick = () => {
  const idSelecionado = parseInt(selectSetores.value);
  if (!setoresSelecionados.includes(idSelecionado)) {
    setoresSelecionados.push(idSelecionado);
    renderizarTags();
  }
};

formEmpresa.onsubmit = async (e) => {
  e.preventDefault();

  if (
    !razaoSocialInput.value.trim() ||
    !nomeFantasiaInput.value.trim() ||
    !cnpjInput.value.trim()
  ) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  if (setoresSelecionados.length === 0) {
    alert("Selecione pelo menos um setor para a empresa.");
    return;
  }

  if (empresaEditandoId !== null) {
    const idx = empresas.findIndex((emp) => emp.id === empresaEditandoId);
    if (idx !== -1) {
      const empresaAtualizada = {
        Id: empresaEditandoId,
        RazaoSocial: razaoSocialInput.value.trim(),
        NomeFantasia: nomeFantasiaInput.value.trim(),
        Cnpj: cnpjInput.value.trim(),
        ListaIds: [...setoresSelecionados],
      };

      const response = await fetch(host + "/empresas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(empresaAtualizada),
      }).then((res) => {
        if (!res.ok) {
          alert(res.message);
          return;
        }

        alert("Empresa atualizada com sucesso!");

        fecharModalEmpresa();
        buscarEmpresasESetores();
      });
    }
  } else {
    const novaEmpresa = {
      RazaoSocial: razaoSocialInput.value.trim(),
      NomeFantasia: nomeFantasiaInput.value.trim(),
      Cnpj: cnpjInput.value.trim(),
      ListaIds: [...setoresSelecionados],
    };

    const response = await fetch(host + "/empresas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novaEmpresa),
    }).then((res) => {
      if (!res.ok) {
        alert(res.message);
        return;
      }

      alert("Empresa adicionada com sucesso!");

      fecharModalEmpresa();
      buscarEmpresasESetores();
    });
  }
};

formSetor.onsubmit = async (e) => {
  e.preventDefault();

  if (!descricaoSetorInput.value.trim()) {
    alert("Digite a descrição do setor.");
    return;
  }

  if (setorEditandoId !== null) {
    const idx = setores.findIndex((s) => s.id === setorEditandoId);
    if (idx !== -1) {
      const response = await fetch(host + "/setores/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao: descricaoSetorInput.value.trim(),
          id: setorEditandoId,
        }),
      }).then((res) => {
        if (!res.ok) {
          alert(res.message);
          return;
        }

        alert("Setor atualizado com sucesso!");
        fecharModalSetor();
        buscarEmpresasESetores();
      });
    }
  } else {
    const response = await fetch(host + "/setores/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ descricao: descricaoSetorInput.value.trim() }),
    }).then((res) => {
      if (!res.ok) {
        alert(res.message);
        return;
      }

      alert("Setor adicionado com sucesso!");
      fecharModalSetor();
      buscarEmpresasESetores();
    });
  }

  fecharModalSetor();
  buscarEmpresasESetores();
};

btnConfirmarExcluir.onclick = async () => {
  if (!itemExcluir) return;
  console.log(itemExcluir);
  if (itemExcluir.tipo === "empresa") {
    const response = await fetch(host + "/empresas/" + itemExcluir.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }).then((res) => {
      if (!res.ok) {
        alert(res.message);
        return;
      }

      alert("Empresa excluída com sucesso!");

      fecharModalConfirmar();
      buscarEmpresasESetores();
    });
  } else if (itemExcluir.tipo === "setor") {
    const response = await fetch(host + "/setores/" + itemExcluir.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }).then((res) => {
      if (!res.ok) {
        alert(res.message);

        return;
      }

      alert("Setor excluído com sucesso!");
      fecharModalConfirmar();
      buscarEmpresasESetores();
    });
  }
};

function abrirModalEdicao(event) {
  const btn = event.target;
  const id = parseInt(btn.getAttribute("data-id"));
  const tipo = btn.getAttribute("data-tipo");

  if (tipo === "empresa") {
    const empresa = empresas.find((e) => e.id === id);
    if (empresa) abrirModalEmpresa(true, empresa);
  } else if (tipo === "setor") {
    const setor = setores.find((s) => s.id === id);
    if (setor) abrirModalSetor(true, setor);
  }
}

window.onclick = (e) => {
  if (e.target === modalEmpresa) fecharModalEmpresa();
  else if (e.target === modalSetor) fecharModalSetor();
  else if (e.target === modalConfirmar) fecharModalConfirmar();
};

cnpjInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 14) value = value.slice(0, 14);
  value = value.replace(/^(\d{2})(\d)/, "$1.$2");
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
  value = value.replace(/(\d{4})(\d)/, "$1-$2");

  e.target.value = value;
});

function renderizarPaginacao(dados) {
  const paginacao = document.getElementById("paginacao");
  paginacao.innerHTML = "";

  if (dados.length > linhasPorPagina) {
    const totalPaginas = Math.ceil(dados.length / linhasPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.disabled = i === paginaAtual;
      btn.addEventListener("click", () => {
        paginaAtual = i;
        atualizarLista(paginaAtual);
      });
      paginacao.appendChild(btn);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarLista(paginaAtual);
});

function adicionarEventosAcoes() {
  const botoesEditar = listaContainer.querySelectorAll(".btn-editar");
  botoesEditar.forEach((btn) => {
    btn.onclick = abrirModalEdicao;
  });

  const botoesExcluir = listaContainer.querySelectorAll(".btn-excluir");
  botoesExcluir.forEach((btn) => {
    btn.onclick = abrirModalConfirmacaoExclusao;
  });
}

function quantidadeItensMudou(elementoSelecionado) {
  const valorSelecionado = elementoSelecionado.value;
  linhasPorPagina = parseInt(valorSelecionado);
  paginaAtual = 1;
  atualizarLista(paginaAtual);
}

buscarEmpresasESetores();
