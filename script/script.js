async function obterComunicacoes() {
    let dataInicio = document.getElementById("dataInicio").value;
    let dataFim = document.getElementById("dataFim").value;
    let oab = document.getElementById("OAB").value;
    let ufOab = document.getElementById("UF").value;
    let nomeParte = document.getElementById("nomeParte").value.trim();

    const url = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?&nomeParte=${nomeParte}&numeroOab=${oab}&ufOab=${ufOab}&dataDisponibilizacaoInicio=${dataInicio}&dataDisponibilizacaoFim=${dataFim}`;

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json"
    };

    // Função para mostrar loading
    function mostrarLoading(mensagem) {
        // Desabilita o botão de busca se existir
        const botaoBuscar = document.getElementById("btnBuscar");
        if (botaoBuscar) {
            botaoBuscar.disabled = true;
            botaoBuscar.textContent = "Carregando...";
        }
        
        // Mostra mensagem de loading
        console.log(mensagem);
        
        // Opcional: criar um elemento visual de loading
        let loadingDiv = document.getElementById("loading-message");
        if (!loadingDiv) {
            loadingDiv = document.createElement("div");
            loadingDiv.id = "loading-message";
            loadingDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 5px;
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(loadingDiv);
        }
        loadingDiv.textContent = mensagem;
        loadingDiv.style.display = "block";
    }

    // Função para esconder loading
    function esconderLoading() {
        // Reabilita o botão de busca se existir
        const botaoBuscar = document.getElementById("btnBuscar");
        if (botaoBuscar) {
            botaoBuscar.disabled = false;
            botaoBuscar.textContent = "Buscar";
        }
        
        // Esconde mensagem de loading
        const loadingDiv = document.getElementById("loading-message");
        if (loadingDiv) {
            loadingDiv.style.display = "none";
        }
    }

    try {
        // Mostra loading durante a requisição
        mostrarLoading("Buscando comunicações...");
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${await response.text()}`);
        }

        // Atualiza mensagem de loading
        mostrarLoading("Processando dados...");
        
        const dados = await response.json();

        if (dados.items && Array.isArray(dados.items)) {
            // Atualiza mensagem de loading
            mostrarLoading("Gerando arquivo Excel...");
            
            // Função para formatar o número do processo
            function formatarNumeroProcesso(numero) {
                if (!numero || numero.length !== 20) return numero;
                return `${numero.slice(0, 7)}-${numero.slice(7, 9)}.${numero.slice(9, 13)}.${numero.slice(13, 14)}.${numero.slice(14, 16)}.${numero.slice(16)}`;
            }

            // Criando os dados formatados para o Excel
            const listaProcessada = dados.items.map(item => ({
                "ID": item.id || "",
                "Data Disponibilização": item.data_disponibilizacao || "",
                "Tribunal": item.siglaTribunal || "",
                "Tipo Comunicação": item.tipoComunicacao || "",
                "Órgão": item.nomeOrgao || "",
                "Texto": item.texto || "",
                "Número Processo": formatarNumeroProcesso(item.numero_processo || ""),
                "Link": item.link || "",
                "Tipo Documento": item.tipoDocumento || "",
                "Classe": item.nomeClasse || "",
                "Número Comunicação": item.numeroComunicacao || "",
                "Status": item.status || "",
                "Meio": item.meiocompleto || "",
                "Destinatários": (item.destinatarios || []).map(dest => dest.nome).join(", "),
                "Advogados": (item.destinatarioadvogados || []).map(adv => adv.advogado.nome).join(", ")
            }));

            // Criando a planilha
            const ws = XLSX.utils.json_to_sheet(listaProcessada);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Comunicações OAB");

            // Gerando nome do arquivo com data e hora
            const now = new Date();
            const timestamp = `${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            const fileName = `comunicacoes_oab_${timestamp}.xlsx`;

            // Gerando e baixando o arquivo Excel
            XLSX.writeFile(wb, fileName);

            // Esconde loading antes de mostrar sucesso
            esconderLoading();
            alert(`Arquivo Excel gerado com sucesso! ${dados.items.length} comunicações encontradas.`);
        } else {
            esconderLoading();
            alert("Nenhuma comunicação encontrada.");
        }
    } catch (error) {
        console.error("Erro ao obter comunicações:", error);
        esconderLoading();
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}