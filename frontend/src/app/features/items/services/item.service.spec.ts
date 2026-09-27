import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ItemService } from './item.service';

describe('ItemService', () => {
  let service: ItemService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ItemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should fetch all items', () => {
    service.findAll().subscribe((items) => expect(items.length).toBe(1));

    const req = http.expectOne('/api/items');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Ejemplo', description: null, createdAt: '', updatedAt: '' }]);
  });

  it('should create an item', () => {
    service.create({ name: 'Nuevo', description: null }).subscribe();

    const req = http.expectOne('/api/items');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Nuevo', description: null });
    req.flush({});
  });
});
