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
    }async function obterComunicacoes() {
    let dataInicio = document.getElementById("dataInicio").value;
    let dataFim = document.getElementById("dataFim").value;
    let oab = document.getElementById("OAB").value;
    let ufOab = document.getElementById("UF").value;
    let nomeParte = document.getElementById("nomeParte").value.trim();
    let texto = document.getElementById("teor").value;
    let siglaTribunal = document.getElementById("Tribunal").value;


    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json"
    };

    // Função para mostrar loading com percentual
    function mostrarLoading(mensagem, progresso = null, total = null) {
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
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 30px;
                border-radius: 10px;
                z-index: 9999;
                font-family: Arial, sans-serif;
                text-align: center;
                min-width: 300px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(loadingDiv);
        }
        
        let conteudo = `<div style="margin-bottom: 15px; font-size: 16px;">${mensagem}</div>`;
        
        if (progresso !== null && total !== null) {
            const percentual = Math.round((progresso / total) * 100);
            conteudo += `
                <div style="margin-bottom: 10px;">
                    <div style="background: #333; border-radius: 10px; padding: 3px; margin: 10px 0;">
                        <div style="background: linear-gradient(90deg, #4CAF50, #45a049); height: 20px; border-radius: 7px; width: ${percentual}%; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="font-size: 14px; color: #ccc;">${progresso} de ${total} páginas (${percentual}%)</div>
                </div>
            `;
        }
        
        conteudo += `
            <div style="margin-top: 15px;">
                <div style="display: inline-block; width: 20px; height: 20px; border: 3px solid #333; border-top: 3px solid #4CAF50; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        loadingDiv.innerHTML = conteudo;
        loadingDiv.style.display = "block";
    }

    // Função para mostrar modal de sucesso
    function mostrarModalSucesso(totalRegistros, paginasPesquisadas, nomeArquivo) {
        // Remove loading se existir
        esconderLoading();
        
        // Cria o modal
        const modal = document.createElement("div");
        modal.id = "modal-sucesso";
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                position: relative;
            ">
                <div style="
                    background: #4CAF50;
                    color: white;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 40px;
                ">✓</div>
                
                <h2 style="
                    color: #333;
                    margin: 0 0 20px 0;
                    font-size: 24px;
                ">Arquivo Gerado com Sucesso!</h2>
                
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border-left: 4px solid #4CAF50;
                ">
                    <div style="margin-bottom: 10px; font-size: 16px; color: #333;">
                        <strong>${totalRegistros}</strong> comunicações encontradas
                    </div>
                    <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
                        ${paginasPesquisadas} página(s) pesquisada(s)
                    </div>
                    <div style="font-size: 14px; color: #666;">
                        Arquivo: <strong>${nomeArquivo}</strong>
                    </div>
                </div>
                
                <button onclick="document.getElementById('modal-sucesso').remove()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
                    Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove o modal ao clicar fora dele
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Função para buscar uma página específica
    async function buscarPagina(pageNumber, pageSize = 100) {
        const url = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?nomeParte=${nomeParte}&numeroOab=${oab}&ufOab=${ufOab}&dataDisponibilizacaoInicio=${dataInicio}&dataDisponibilizacaoFim=${dataFim}&page=${pageNumber}&size=${pageSize}&texto=${encodeURIComponent(texto)}&siglaTribunal=${siglaTribunal}`;

        console.log(url);
        
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
            mostrarLoading(`Buscando comunicações...`, paginaAtual, maxPaginas);
            
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
            mostrarModalSucesso(0, paginaAtual - 1, "Nenhum arquivo gerado");
            return;
        }

        mostrarLoading("Processando dados...");
        
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

        // Mostra modal de sucesso
        mostrarModalSucesso(todosItens.length, paginaAtual - 1, fileName);
        
    } catch (error) {
        console.error("Erro ao obter comunicações:", error);
        esconderLoading();
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}