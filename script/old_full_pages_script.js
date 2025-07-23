async function obterComunicacoes() {
    let dataInicio = document.getElementById("dataInicio").value;
    let dataFim = document.getElementById("dataFim").value;
    let oab = document.getElementById("OAB").value;
    let ufOab = document.getElementById("UF").value;
    let nomeParte = document.getElementById("nomeParte").value.trim();

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json"
    };

    // Função para mostrar loading
    function mostrarLoading(mensagem) {
        const botaoBuscar = document.getElementById("btnBuscar");
        if (botaoBuscar) {
            botaoBuscar.disabled = true;
            botaoBuscar.textContent = "Carregando...";
        }
        
        console.log(mensagem);
        
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
        const botaoBuscar = document.getElementById("btnBuscar");
        if (botaoBuscar) {
            botaoBuscar.disabled = false;
            botaoBuscar.textContent = "Buscar";
        }
        
        const loadingDiv = document.getElementById("loading-message");
        if (loadingDiv) {
            loadingDiv.style.display = "none";
        }
    }

    // Função para buscar uma página específica
    async function buscarPagina(pageNumber, pageSize = 100) {
        const url = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?nomeParte=${nomeParte}&numeroOab=${oab}&ufOab=${ufOab}&dataDisponibilizacaoInicio=${dataInicio}&dataDisponibilizacaoFim=${dataFim}&page=${pageNumber}&size=${pageSize}`;
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${await response.text()}`);
        }
        
        return await response.json();
    }

    try {
        mostrarLoading("Iniciando busca de comunicações...");
        
        // Array para armazenar todos os itens de todas as páginas
        let todosItens = [];
        let paginaAtual = 1;
        let paginasVazias = 0;
        const maxPaginas = 100;
        
        // Percorre as páginas de 1 a 100 até encontrar uma página vazia
        while (paginaAtual <= maxPaginas) {
            mostrarLoading(`Buscando página ${paginaAtual}... (${todosItens.length} registros coletados)`);
            
            try {
                const respostaPagina = await buscarPagina(paginaAtual);
                
                // Verifica se a página tem itens
                if (respostaPagina.items && Array.isArray(respostaPagina.items) && respostaPagina.items.length > 0) {
                    todosItens.push(...respostaPagina.items);
                    console.log(`Página ${paginaAtual}: ${respostaPagina.items.length} itens encontrados`);
                    paginasVazias = 0; // Reset contador de páginas vazias
                } else {
                    console.log(`Página ${paginaAtual}: vazia`);
                    paginasVazias++;
                    
                    // Se encontrar uma página vazia, para a busca
                    if (paginasVazias >= 1) {
                        console.log("Página vazia encontrada. Finalizando busca.");
                        break;
                    }
                }
                
                paginaAtual++;
                
                // Pequena pausa para evitar sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.warn(`Erro ao buscar página ${paginaAtual}:`, error);
                paginaAtual++;
                
                // Se houver muitos erros consecutivos, para
                if (paginaAtual > maxPaginas) {
                    break;
                }
            }
        }
        
        if (todosItens.length === 0) {
            esconderLoading();
            alert("Nenhuma comunicação encontrada.");
            return;
        }
        
        mostrarLoading(`Processando ${todosItens.length} registros encontrados...`);
        
        // Função para formatar o número do processo
        function formatarNumeroProcesso(numero) {
            if (!numero || numero.length !== 20) return numero;
            return `${numero.slice(0, 7)}-${numero.slice(7, 9)}.${numero.slice(9, 13)}.${numero.slice(13, 14)}.${numero.slice(14, 16)}.${numero.slice(16)}`;
        }

        // Criando os dados formatados para o Excel
        const listaProcessada = todosItens.map(item => ({
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

        mostrarLoading("Gerando arquivo Excel...");

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

        esconderLoading();
        alert(`Arquivo Excel gerado com sucesso! ${todosItens.length} comunicações encontradas em ${paginaAtual - 1} página(s) pesquisada(s).`);
        
    } catch (error) {
        console.error("Erro ao obter comunicações:", error);
        esconderLoading();
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}



