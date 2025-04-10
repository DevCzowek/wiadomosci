import os
import json
import re
from pathlib import Path

def extract_username_from_filename(filename):
    """Próbuje wyciągnąć czytelną nazwę z pliku DM"""
    # Usuń prefix "Direct Messages - " i suffix [ID].html
    clean_name = re.sub(r'^Direct Messages - ', '', filename)
    clean_name = re.sub(r' \[\d+\]\.html$', '', clean_name)
    
    # Jeśli nazwa zawiera tylko znaki specjalne (jak przykład z Bóg), zostawiamy oryginalną
    if not re.search(r'[\w\s]', clean_name):
        return filename  # Zwracamy oryginalną nazwę jeśli nie ma żadnych "normalnych" znaków
    return clean_name

def scan_exports_directory(root_dir):
    """Skanuje strukturę katalogów z eksportami i zwraca dane w formacie JSON"""
    data = {
        "dms": {},
        "servers": {}
    }
    
    # Skanuj DM-y
    dms_dir = Path(root_dir) / "dms"
    if dms_dir.exists():
        for date_dir in dms_dir.iterdir():
            if date_dir.is_dir():
                date_str = date_dir.name
                data["dms"][date_str] = []
                
                for dm_file in date_dir.glob("*.html"):
                    username = extract_username_from_filename(dm_file.stem)
                    data["dms"][date_str].append({
                        "display_name": username,
                        "file_path": str(dm_file.relative_to(root_dir))
                    })
    
    # Skanuj serwery
    servers_dir = Path(root_dir) / "servers"
    if servers_dir.exists():
        for server_dir in servers_dir.iterdir():
            if server_dir.is_dir():
                server_name = server_dir.name
                data["servers"][server_name] = {}
                
                for date_dir in server_dir.iterdir():
                    if date_dir.is_dir():
                        date_str = date_dir.name
                        data["servers"][server_name][date_str] = []
                        
                        for channel_file in date_dir.glob("*.html"):
                            channel_name = channel_file.stem
                            data["servers"][server_name][date_str].append({
                                "channel_name": channel_name,
                                "file_path": str(channel_file.relative_to(root_dir))
                            })
    
    return data

def main():
    exports_dir = input("Podaj ścieżkę do folderu z eksportami (gdzie są foldery 'dms' i 'servers'): ")
    output_file = "exports_data.json"
    
    data = scan_exports_directory(exports_dir)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Wygenerowano plik {output_file} z listą eksportów.")

if __name__ == "__main__":
    main()