"""
Aplicação principal: abre um diálogo para selecionar o Excel de entrada,
processa os dados (linha a linha) e grava um novo arquivo com:
  - Uma aba principal com todas as linhas processadas.
  - Uma aba "repeticoes" com o processamento das amostras médias
    (quando houver repetições de nomes em "amostra").

Uso:
    python main.py
"""

from pathlib import Path
from typing import Optional

import pandas as pd

try:
    import tkinter as tk
    from tkinter import filedialog, messagebox
except Exception:  # ambiente sem tkinter (por exemplo, execução em servidor)
    tk = None
    filedialog = None
    messagebox = None

from processamento import (
    carregar_malha_e_referencia,
    process_dataframe,
    process_repeticoes, adicionar_estatistica_por_amostra,
)


COLUNAS_OBRIGATORIAS = [
    "amostra",
    "w_alcool",
    "sampleTemperature",
    "delta_v",
    "hm",
    "t_amostra",
    "t_agua",
]


def escolher_arquivo_excel() -> Optional[Path]:
    """Abre um diálogo para o usuário escolher um arquivo Excel de entrada."""
    if filedialog is None:
        # Fallback: perguntar no console
        caminho = input("Informe o caminho do arquivo Excel de entrada (.xlsx/.xls): ").strip()
        if not caminho:
            return None
        return Path(caminho)

    root = tk.Tk()
    root.withdraw()
    filetypes = [
        ("Planilhas Excel", "*.xlsx *.xls"),
        ("Todos os arquivos", "*.*"),
    ]
    filename = filedialog.askopenfilename(
        title="Selecione o arquivo Excel de entrada",
        filetypes=filetypes,
    )
    root.destroy()

    if not filename:
        return None
    return Path(filename)


def validar_colunas_minimas(df: pd.DataFrame) -> None:
    """Garante que o DataFrame possui as colunas mínimas esperadas."""
    missing = [col for col in COLUNAS_OBRIGATORIAS if col not in df.columns]
    if missing:
        raise ValueError(
            "As seguintes colunas obrigatórias não foram encontradas na planilha: "
            f"{missing}\nColunas presentes: {list(df.columns)}"
        )


def main():
    base_dir = Path(__file__).resolve().parent

    # 1) Escolher arquivo de entrada
    excel_path = escolher_arquivo_excel()
    if excel_path is None:
        print("Nenhum arquivo selecionado. Encerrando.")
        return

    # 2) Ler planilha de entrada
    try:
        df_in = pd.read_excel(excel_path)
    except Exception as e:
        print(f"Erro ao ler o arquivo Excel de entrada: {e}")
        if messagebox is not None:
            messagebox.showerror("Erro ao ler", f"Erro ao ler o arquivo Excel de entrada:\n{e}")
        return

    # 3) Validar colunas mínimas
    try:
        validar_colunas_minimas(df_in)
    except Exception as e:
        print(str(e))
        if messagebox is not None:
            messagebox.showerror("Colunas obrigatórias ausentes", str(e))
        return

    # 4) Carregar malha de viscosidade ternária e tabela de referência da água
    try:
        malha_df, temp_ref_df, temp_col = carregar_malha_e_referencia(base_dir)
    except Exception as e:
        print(f"Erro ao carregar malha/tabela de referência: {e}")
        if messagebox is not None:
            messagebox.showerror("Erro ao carregar dados auxiliares", str(e))
        return

    # 5) Processar todas as linhas (resultado principal)
    try:
        df_resultados = process_dataframe(df_in.copy(), malha_df, temp_ref_df, temp_col)
    except Exception as e:
        print(f"Erro no processamento linha a linha: {e}")
        if messagebox is not None:
            messagebox.showerror("Erro no processamento", f"Erro ao processar as linhas:\n{e}")
        return

    # 6) Processar repetições por amostra (médias)
    try:
        df_repeticoes = process_repeticoes(df_in.copy(), malha_df, temp_ref_df, temp_col)
    except Exception as e:
        print(f"Erro no processamento das repetições: {e}")
        if messagebox is not None:
            messagebox.showerror("Erro nas repetições", f"Erro ao processar repetições:\n{e}")
        return


    # 6.1) Estatística por amostra (Monte Carlo) e probabilidades
    try:
        df_repeticoes = adicionar_estatistica_por_amostra(
            df_linhas=df_resultados,
            df_repeticoes_processado=df_repeticoes,
            malha_df=malha_df,
        )
    except Exception as e:
        print(f"Erro na avaliação estatística (Monte Carlo): {e}")
        if messagebox is not None:
            messagebox.showerror("Erro estatístico", f"Erro na avaliação estatística (Monte Carlo):\n{e}")
        return

    # 7) Definir caminho de saída
    output_path = excel_path.with_name(excel_path.stem + "_processado.xlsx")

    # 8) Salvar Excel com duas abas: resultados e repeticoes
    try:
        with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
            df_resultados.to_excel(writer, index=False, sheet_name="resultados")
            df_repeticoes.to_excel(writer, index=False, sheet_name="repeticoes")
    except Exception as e:
        print(f"Erro ao salvar o Excel de saída: {e}")
        if messagebox is not None:
            messagebox.showerror("Erro ao salvar", f"Erro ao salvar o arquivo de saída:\n{e}")
        return

    msg = f"Processamento concluído!\nArquivo salvo em:\n{output_path}"
    print(msg)
    if messagebox is not None:
        messagebox.showinfo("Concluído", msg)


if __name__ == "__main__":
    main()
