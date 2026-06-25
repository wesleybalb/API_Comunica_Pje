function esconderLoading() {
    const btn = document.getElementById("btnBuscar");
    if (btn) { btn.disabled = false; btn.textContent = "Buscar"; }
    const div = document.getElementById("loading-message");
    if (div) div.style.display = "none";
}

function removerDuplicatas(itens) {
    const vistos = new Set();
    const unicos = [];
    for (const item of itens) {
        if (!item.id || vistos.has(item.id)) continue;
        vistos.add(item.id);
        unicos.push(item);
    }
    return {
        itensUnicos: unicos,
        duplicatasRemovidas: itens.length - unicos.length,
        totalOriginal: itens.length
    };
}

async function obterComunicacoes() {
    const dataInicio    = document.getElementById("dataInicio").value;
    const dataFim       = document.getElementById("dataFim").value;
    const oab           = document.getElementById("OAB").value;
    const ufOab         = document.getElementById("UF").value;
    const nomeParte     = document.getElementById("nomeParte").value.trim();
    const texto         = document.getElementById("teor").value;
    const siglaTribunal = document.getElementById("Tribunal").value;

    const PAGE_SIZE   = 100;
    const MAX_PAGINAS = 100;

    function buildUrl(page) {
        const params = new URLSearchParams({
            nomeParte,
            numeroOab:                  oab,
            ufOab,
            dataDisponibilizacaoInicio: dataInicio,
            dataDisponibilizacaoFim:    dataFim,
            page,
            size:                       PAGE_SIZE,
            texto,
            siglaTribunal
        });
        return `https://comunicaapi.pje.jus.br/api/v1/comunicacao?${params}`;
    }

    function mostrarLoading(mensagem, progresso = null, total = null) {
        const btn = document.getElementById("btnBuscar");
        if (btn) { btn.disabled = true; btn.textContent = "Carregando..."; }

        let div = document.getElementById("loading-message");
        if (!div) {
            div = document.createElement("div");
            div.id = "loading-message";
            div.style.cssText = `
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9); color: white;
                padding: 30px; border-radius: 10px;
                z-index: 9999; font-family: Arial, sans-serif;
                text-align: center; min-width: 300px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(div);
        }

        let html = `<div style="margin-bottom: 15px; font-size: 16px;">${mensagem}</div>`;

        if (progresso !== null && total !== null && total > 0) {
            const pct = Math.round((progresso / total) * 100);
            html += `
                <div style="background: #333; border-radius: 10px; padding: 3px; margin: 10px 0;">
                    <div style="background: linear-gradient(90deg, #4CAF50, #45a049); height: 20px; border-radius: 7px; width: ${pct}%; transition: width 0.3s ease;"></div>
                </div>
                <div style="font-size: 14px; color: #ccc;">${progresso} de ${total} página(s) (${pct}%)</div>
            `;
        }

        html += `
            <div style="margin-top: 15px;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #333; border-top: 3px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        `;

        div.innerHTML = html;
        div.style.display = "block";
    }

    function mostrarModalSucesso(totalRegistros, paginasPesquisadas, nomeArquivo, duplicatasRemovidas = 0, totalOriginal = 0) {
        esconderLoading();

        const modal = document.createElement("div");
        modal.id = "modal-sucesso";
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            font-family: Arial, sans-serif;
        `;

        let resumo = `
            <div style="margin-bottom: 10px; font-size: 16px; color: #333;">
                <strong>${totalRegistros}</strong> comunicações únicas encontradas
            </div>
            <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
                ${paginasPesquisadas} página(s) pesquisada(s)
            </div>
        `;

        if (duplicatasRemovidas > 0) {
            resumo += `
                <div style="margin-bottom: 10px; font-size: 14px; color: #ff6b35; border-left: 3px solid #ff6b35; padding-left: 10px;">
                    ${duplicatasRemovidas} duplicata(s) removida(s)
                </div>
                <div style="margin-bottom: 10px; font-size: 12px; color: #999;">
                    Total original: ${totalOriginal} registros
                </div>
            `;
        }

        resumo += `<div style="font-size: 14px; color: #666;">Arquivo: <strong>${nomeArquivo}</strong></div>`;

        modal.innerHTML = `
            <div style="
                background: white; padding: 40px; border-radius: 15px;
                text-align: center; max-width: 500px; width: 90%;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            ">
                <div style="
                    background: #4CAF50; color: white; width: 80px; height: 80px;
                    border-radius: 50%; display: flex; align-items: center;
                    justify-content: center; margin: 0 auto 20px; font-size: 40px;
                ">✓</div>
                <h2 style="color: #333; margin: 0 0 20px; font-size: 24px;">Arquivo Gerado com Sucesso!</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                    ${resumo}
                </div>
                <button onclick="document.getElementById('modal-sucesso').remove()"
                    style="background: #4CAF50; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; cursor: pointer;"
                    onmouseover="this.style.background='#45a049'"
                    onmouseout="this.style.background='#4CAF50'">
                    Fechar
                </button>
            </div>
        `;

        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    }

    async function buscarPagina(page) {
        const response = await fetch(buildUrl(page), { headers: { "Accept": "application/json" } });
        if (!response.ok) {
            const msg = await response.text().catch(() => response.statusText);
            throw new Error(`HTTP ${response.status}: ${msg}`);
        }
        return response.json();
    }

    function formatarNumeroProcesso(numero) {
        if (!numero || numero.length !== 20) return numero;
        return `${numero.slice(0, 7)}-${numero.slice(7, 9)}.${numero.slice(9, 13)}.${numero.slice(13, 14)}.${numero.slice(14, 16)}.${numero.slice(16)}`;
    }

    try {
        mostrarLoading("Iniciando busca de comunicações...");

        // Primeira página — usada também para detectar metadados de paginação
        const primeiraResposta = await buscarPagina(1);
        const itensPrimeiraPagina = primeiraResposta.items ?? [];

        if (itensPrimeiraPagina.length === 0) {
            esconderLoading();
            mostrarModalSucesso(0, 1, "Nenhum arquivo gerado");
            return;
        }

        // Tenta obter o total de páginas dos metadados da resposta
        const totalPaginas =
            primeiraResposta.totalPages
            ?? primeiraResposta.pages
            ?? (primeiraResposta.count != null
                ? Math.ceil(primeiraResposta.count / PAGE_SIZE)
                : null);

        const limite = totalPaginas ?? MAX_PAGINAS;
        const todosItens = [...itensPrimeiraPagina];
        let paginasFetched = 1;

        mostrarLoading("Buscando comunicações...", 1, limite);

        for (let pagina = 2; pagina <= limite; pagina++) {
            mostrarLoading("Buscando comunicações...", pagina, limite);

            try {
                const resposta = await buscarPagina(pagina);
                const itens = resposta.items ?? [];

                if (itens.length === 0) break; // sem resultados = fim

                todosItens.push(...itens);
                paginasFetched++;

                if (itens.length < PAGE_SIZE) break; // página incompleta = última

            } catch (err) {
                console.warn(`Erro na página ${pagina}:`, err);
            }

            await new Promise(r => setTimeout(r, 150));
        }

        mostrarLoading("Removendo duplicatas...");
        const { itensUnicos, duplicatasRemovidas, totalOriginal } = removerDuplicatas(todosItens);

        mostrarLoading("Gerando arquivo Excel...");

        const listaProcessada = itensUnicos.map(item => ({
            "ID":                    item.id || "",
            "Data Disponibilização": item.data_disponibilizacao || "",
            "Tribunal":              item.siglaTribunal || "",
            "Tipo Comunicação":      item.tipoComunicacao || "",
            "Órgão":                 item.nomeOrgao || "",
            "Texto":                 item.texto || "",
            "Número Processo":       formatarNumeroProcesso(item.numero_processo || ""),
            "Link":                  item.link || "",
            "Tipo Documento":        item.tipoDocumento || "",
            "Classe":                item.nomeClasse || "",
            "Número Comunicação":    item.numeroComunicacao || "",
            "Status":                item.status || "",
            "Meio":                  item.meiocompleto || "",
            "Destinatários":         (item.destinatarios ?? []).map(d => d.nome).join(", "),
            "Advogados":             (item.destinatarioadvogados ?? []).map(a => a.advogado.nome).join(", ")
        }));

        const ws = XLSX.utils.json_to_sheet(listaProcessada);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Comunicações OAB");

        const now = new Date();
        const ts  = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `comunicacoes_oab_${ts}.xlsx`;

        XLSX.writeFile(wb, fileName);

        mostrarModalSucesso(itensUnicos.length, paginasFetched, fileName, duplicatasRemovidas, totalOriginal);

    } catch (err) {
        console.error("Erro ao obter comunicações:", err);
        esconderLoading();
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}
