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

// Função para remover duplicatas baseado no ID
function removerDuplicatas(itens) {
    const idsEncontrados = new Set();
    const itensUnicos = [];
    let duplicatasRemovidasCount = 0;
    
    console.log(`=== REMOVENDO DUPLICATAS ===`);
    console.log(`Total de itens para processar: ${itens.length}`);
    
    for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        const id = item.id;
        
        // Debug: Mostra alguns itens sendo processados
        if (i < 5 || (i % 100 === 0)) {
            console.log(`Processando item ${i + 1}: ID = ${id}`);
        }
        
        // Verifica se o item tem ID válido
        if (!id) {
            console.warn(`Item sem ID encontrado no índice ${i}:`, item);
            continue;
        }
        
        // Se o ID já foi encontrado, pula este item (duplicata)
        if (idsEncontrados.has(id)) {
            duplicatasRemovidasCount++;
            console.log(`Duplicata removida - ID: ${id} (item ${i + 1})`);
            continue;
        }
        
        // Se é a primeira vez que vemos este ID, adiciona aos únicos
        idsEncontrados.add(id);
        itensUnicos.push(item);
    }
    
    console.log(`Total de duplicatas removidas: ${duplicatasRemovidasCount}`);
    console.log(`Registros únicos: ${itensUnicos.length}`);
    console.log(`IDs únicos encontrados: ${idsEncontrados.size}`);
    
    return {
        itensUnicos,
        duplicatasRemovidas: duplicatasRemovidasCount,
        totalOriginal: itens.length
    };
}

async function obterComunicacoes() {
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

    // Função para mostrar modal de sucesso (atualizada para mostrar duplicatas removidas)
    function mostrarModalSucesso(totalRegistros, paginasPesquisadas, nomeArquivo, duplicatasRemovidas = 0, totalOriginal = 0) {
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
        
        // Constrói o conteúdo do resumo
        let resumoConteudo = `
            <div style="margin-bottom: 10px; font-size: 16px; color: #333;">
                <strong>${totalRegistros}</strong> comunicações únicas encontradas
            </div>
            <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
                ${paginasPesquisadas} página(s) pesquisada(s)
            </div>
        `;
        
        // Adiciona informação sobre duplicatas se houver
        if (duplicatasRemovidas > 0) {
            resumoConteudo += `
                <div style="margin-bottom: 10px; font-size: 14px; color: #ff6b35; border-left: 3px solid #ff6b35; padding-left: 10px;">
                    ${duplicatasRemovidas} duplicata(s) removida(s)
                </div>
                <div style="margin-bottom: 10px; font-size: 12px; color: #999;">
                    Total original: ${totalOriginal} registros
                </div>
            `;
        }
        
        resumoConteudo += `
            <div style="font-size: 14px; color: #666;">
                Arquivo: <strong>${nomeArquivo}</strong>
            </div>
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
                    ${resumoConteudo}
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

        mostrarLoading("Removendo duplicatas...");
        
        // Debug: Mostra alguns IDs antes de remover duplicatas
        console.log("=== DEBUG: Primeiros 10 IDs encontrados ===");
        todosItens.slice(0, 10).forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}`);
        });
        console.log(`Total de itens coletados: ${todosItens.length}`);
        
        // Remove duplicatas baseado no ID
        const resultadoSemDuplicatas = removerDuplicatas(todosItens);
        const itensUnicos = resultadoSemDuplicatas.itensUnicos;
        
        console.log("=== DEBUG: Primeiros 10 IDs únicos após remoção ===");
        itensUnicos.slice(0, 10).forEach((item, index) => {
            console.log(`${index + 1}. ID: ${item.id}`);
        });
        
        console.log(`Registros antes da remoção de duplicatas: ${resultadoSemDuplicatas.totalOriginal}`);
        console.log(`Registros após remoção de duplicatas: ${itensUnicos.length}`);
        console.log(`Duplicatas removidas: ${resultadoSemDuplicatas.duplicatasRemovidas}`);

        mostrarLoading("Processando dados...");
        
        // Função para formatar o número do processo
        function formatarNumeroProcesso(numero) {
            if (!numero || numero.length !== 20) return numero;
            return `${numero.slice(0, 7)}-${numero.slice(7, 9)}.${numero.slice(9, 13)}.${numero.slice(13, 14)}.${numero.slice(14, 16)}.${numero.slice(16)}`;
        }

        // Criando os dados formatados para o Excel (usando apenas itens únicos)
        const listaProcessada = itensUnicos.map((item, index) => {
            // Debug: Log dos primeiros 3 itens sendo processados
            if (index < 3) {
                console.log(`Processando item ${index + 1} para Excel:`, {
                    id: item.id,
                    data: item.data_disponibilizacao,
                    tribunal: item.siglaTribunal
                });
            }
            
            return {
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
            };
        });

        console.log(`Total de linhas que serão adicionadas ao Excel: ${listaProcessada.length}`);

        mostrarLoading("Gerando arquivo Excel...");

        console.log("=== DEBUG: GERAÇÃO DO EXCEL ===");
        console.log(`Dados para Excel - Total de registros: ${listaProcessada.length}`);
        console.log("Primeiros 3 registros:", listaProcessada.slice(0, 3));
        
        // Verificação extra: se listaProcessada está vazia ou com problema
        if (!listaProcessada || listaProcessada.length === 0) {
            console.error("ERRO: listaProcessada está vazia!");
            esconderLoading();
            alert("Erro: Nenhum dado para gerar Excel!");
            return;
        }

        // Criando a planilha com log detalhado
        console.log("Criando worksheet...");
        const ws = XLSX.utils.json_to_sheet(listaProcessada);
        console.log("Worksheet criado:", ws);
        
        console.log("Criando workbook...");
        const wb = XLSX.utils.book_new();
        
        console.log("Adicionando sheet ao workbook...");
        XLSX.utils.book_append_sheet(wb, ws, "Comunicações OAB");
        
        console.log("Workbook final:", wb);

        // Gerando nome do arquivo com data e hora
        const now = new Date();
        const timestamp = `${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        const fileName = `comunicacoes_oab_${timestamp}.xlsx`;

        console.log(`Gerando arquivo: ${fileName}`);
        
        // Gerando e baixando o arquivo Excel
        try {
            XLSX.writeFile(wb, fileName);
            console.log("Arquivo Excel gerado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar arquivo Excel:", error);
            esconderLoading();
            alert("Erro ao gerar arquivo Excel: " + error.message);
            return;
        }

        // Mostra modal de sucesso com informações sobre duplicatas
        mostrarModalSucesso(
            itensUnicos.length, 
            paginaAtual - 1, 
            fileName, 
            resultadoSemDuplicatas.duplicatasRemovidas,
            resultadoSemDuplicatas.totalOriginal
        );
        
    } catch (error) {
        console.error("Erro ao obter comunicações:", error);
        esconderLoading();
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}