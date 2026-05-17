import { Component, OnInit, inject, output } from '@angular/core';
import { CategoryService } from '../../../../shared/services/category';

@Component({
  selector: 'app-category-links',
  standalone: true,
  templateUrl: './category-links.html'
})
export class CategoryLinksComponent implements OnInit {
  private categoryService = inject(CategoryService);
  categories: any[] = [
    { id: 1, name: 'Tecnologia' },
    { id: 2, name: 'Telemóveis' },
    { id: 3, name: 'Computadores' },
    { id: 4, name: 'Moda' },
    { id: 5, name: 'Beleza' },
    { id: 6, name: 'Alimentação' },
    { id: 7, name: 'Desporto' },
    { id: 8, name: 'Acessórios' },
    { id: 9, name: 'Casa' },
    { id: 10, name: 'Outros' },
  ];
  selectedCategoryName: string | null = null;
  categorySelected = output<string | null>();

  // Mapeamento de ícones baseados no nome da categoria
  getIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Tecnologia': 'devices',
      'Telemóveis': 'smartphone',
      'Computadores': 'laptop_mac',
      'Moda': 'checkroom',
      'Beleza': 'spa',
      'Alimentação': 'restaurant',
      'Desporto': 'sports_soccer',
      'Acessórios': 'watch',
      'Casa': 'home',
      'Outros': 'category',
    };
    
    // Retorna o ícone do mapa ou um padrão caso o nome não coincida
    return icons[categoryName] || 'category';
  }

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (dados) => {
        if (Array.isArray(dados) && dados.length > 0) {
          this.categories = dados;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
      }
    });
  }

  selectCategory(categoryName: string | null) {
    this.selectedCategoryName = categoryName;
    console.log('Categoria clicada:', categoryName ?? 'Todos');
    this.categorySelected.emit(categoryName);
  }
}
