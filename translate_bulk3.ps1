# Etapa 2 - Batch 3 FINAL - Remaining strings
$ErrorActionPreference = "Stop"
$root = "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_deploy_railway\src"
$count = 0

$replacements = @(
    # --- Results page semaphore/compat logic ---
    @("return ""Compatível""", "return ""Compatible"""),
    @("return ""Incompatível""", "return ""Incompatible"""),
    @("if (equivalentes) return ""Incompatível""", "if (equivalentes) return ""Incompatible"""),
    @("compatStatus === ""Compatível""", "compatStatus === ""Compatible"""),
    @("compatStatus === ""Incompatível""", "compatStatus === ""Incompatible"""),
    @("texto: ""Incompatível com o rótulo""", "texto: ""Incompatible with the label"""),
    @("texto: ""Necessários mais dados experimentais""", "texto: ""More experimental data needed"""),
    @("compatStatus !== ""Compatível""", "compatStatus !== ""Compatible"""),
    @("nenhuma localizada", "none found"),
    
    # --- Results page tabs and headers ---
    @("""Resultados"" | ""Experimental date""", """Results"" | ""Experimental data"""),
    @("setActiveTab(""Resultados"")", "setActiveTab(""Results"")"),
    @("activeTab === ""Resultados""", "activeTab === ""Results"""),
    @(">Resultados<", ">Results<"),
    @("Relatório | Exame de Triagem", "Report | Screening Test"),
    @("Síntese analítica dos resultados", "Analytical summary of results"),
    @("Rótulo e resultados", "Label and results"),
    @("Composição equivalente compatível com rótulo:", "Equivalent composition compatible with label:"),
    @("Composição mais provável", "Most probable composition"),
    @("Composição % m/m esperada:", "Expected % w/w composition:"),
    @("Composição esperada (m/m)", "Expected composition (w/w)"),
    @("Escoamento - Amostra", "Flow - Sample"),
    @("Escoamento - Água", "Flow - Water"),
    @("Instantes de escoamento:", "Flow time instants:"),
    @("Ajuste(s) linear do escoamento", "Linear fit of flow"),
    @("Tempo estimado escoamento (s):", "Estimated flow time (s):"),
    @("Time estimado escoamento (s):", "Estimated flow time (s):"),
    @("Interpretação do Relatório", "Report Interpretation"),
    @("Este é um exame de triagem estimativo", "This is an estimative screening test"),
    @("Aguarde enquanto calculamos os resultados.", "Please wait while calculating results."),
    @("ResultadosPage", "ResultsPage"),
    
    # --- Remaining StepTimes ---
    @("Registre os escoamentos", "Record the flows"),
    @("escoamento da água", "water flow"),
    @("escoamento da amostra", "sample flow"),
    @("Escolha o método", "Choose the method"),
    @("Inserir tempo manualmente", "Enter time manually"),
    @("Adicionar vídeo", "Add video"),
    @("Remover vídeo", "Remove video"),
    @("replicata da água", "water replicate"),
    @("replicata da amostra", "sample replicate"),
    
    # --- StepDensity precision messages (remaining) ---
    @("As massas informadas sugerem inicialmente um", "The reported masses initially suggest an"),
    @("teor alcoólico de cerca de", "alcohol content of approximately"),
    @("Considerando a incerteza típica de balanças desse tipo", "Considering the typical uncertainty of this type of scale"),
    @("o teor alcoólico da amostra pode estar entre", "the sample alcohol content may be between"),
    @("Como o teor de rótulo está dentro desse intervalo", "Since the label content is within this range"),
    @("a análise pode prosseguir", "the analysis may proceed"),
    @("porém com menor seletividade", "but with lower selectivity"),
    @("considera-se um intervalo contido no anterior e mais estreito em torno do teor do rótulo", "a narrower interval around the label content is considered"),
    @("Para maior confiabilidade, recomenda-se repetir esta etapa com uma", "For greater reliability, it is recommended to repeat this step with a"),
    @("balança com pelo menos uma casa decimal", "scale with at least one decimal place"),
    @("ou com um densímetro", "or with a hydrometer"),
    @("Inconsistência entre densidade e teor de rótulo", "Inconsistency between density and label content"),
    @("que, em conjunto com a baixa sensibilidade da balança,", "which, combined with the low sensitivity of the scale,"),
    @("impede a análise de avançar", "prevents the analysis from proceeding"),
    @("Considerando as massas informadas e variações máximas em cada pesagem", "Considering the reported masses and maximum variations in each weighing"),
    @("obtivemos teor alcoólico inicial de", "we obtained an initial alcohol content of"),
    @("e um intervalo possível entre", "and a possible range between"),
    @("Como o teor de rótulo não se encontra dentro desse intervalo", "Since the label content is not within this range"),
    @("e a sensibilidade das pesagens é insuficiente para restringir a faixa estimada", "and the weighing sensitivity is insufficient to restrict the estimated range"),
    @("recomenda-se repetir as pesagens com uma balança com pelo menos uma casa decimal", "it is recommended to repeat the weighings with a scale with at least one decimal place"),
    @("ou utilizar um densímetro", "or use a hydrometer"),
    @("As massas informadas indicam um teor alcoólico inicial de cerca de", "The reported masses indicate an initial alcohol content of approximately"),
    @("Considerando a incerteza típica de balanças sem casa decimal", "Considering the typical uncertainty of scales without a decimal place"),
    @("o teor alcoólico pode estar entre", "the alcohol content may be between"),
    @("Para maior confiabilidade, recomenda-se usar uma balança com pelo menos uma casa decimal.", "For greater reliability, it is recommended to use a scale with at least one decimal place."),
    @("o uso do teor de rótulo reduz a seletividade da análise", "using the label content reduces the selectivity of the analysis"),
    @("Passa a funcionar como checagem de compatibilidade entre o teor declarado e o escoamento experimental", "It works as a compatibility check between the declared content and the experimental flow"),
    @("Em muitos casos, não exclui a possibilidade de outras composições hidroalcoólicas.", "In many cases, it does not exclude the possibility of other hydroalcoholic compositions."),
    
    # --- Layout/metadata ---
    @("Triagem de Metanol", "Methanol Screening"),
    @("triagem de metanol", "methanol screening"),
    
    # --- schemas.ts remaining ---
    @("Selecione uma opção", "Select an option"),
    
    # --- MultiSelectDropdown ---
    @("Selecione...", "Select..."),
    
    # --- AnalysisListPage remaining ---
    @("análises salvas", "saved analyses"),
    @("Nenhuma análise salva", "No saved analyses"),
    @("Apagar selecionadas", "Delete selected"),
    @("Selecione análises para excluir", "Select analyses to delete"),
    @("Deseja excluir", "Do you want to delete"),
    @("Todas as análises", "All analyses"),
    @("análise(s) selecionada(s)", "selected analysis(es)"),
    @("Exportar banco completo", "Export full database"),
    @("Importar banco", "Import database"),
    @("Última medição", "Last measurement"),
    
    # --- alcoolWorkerClient remaining ---
    @("resultados do pipeline", "pipeline results"),
    @("Erro ao executar", "Error executing")
)

$files = Get-ChildItem -Path $root -Recurse -Include "*.tsx","*.ts" -Exclude "methodologyContent.tsx"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
    $original = $content
    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $count++
        Write-Output "Updated: $($file.Name)"
    }
}
Write-Output "Total files updated batch 3: $count"
