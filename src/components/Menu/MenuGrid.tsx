import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { getMenus } from "../../api/menus";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  isActive: boolean;
  isSoldOut: boolean;
  categoryName?: string;
};

export default function MenuGrid() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 등록 모달 상태
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const nextId = useMemo(() => {
    const n = Math.max(0, ...items.map((x) => Number(x.id))) + 1;
    return String(n);
  }, [items]);

  // 컴포넌트 마운트 시 메뉴 목록 조회
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('메뉴 목록 조회 시작...');
        const data = await getMenus();
        console.log('메뉴 목록 조회 성공:', data.length, '개');
        
        setItems(data);
      } catch (err) {
        console.error('메뉴 목록 조회 실패:', err);
        setError('메뉴 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const toggleActive = (id: string) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isActive: !it.isActive } : it))
    );

  const toggleSoldOut = (id: string) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, isSoldOut: !it.isSoldOut } : it
      )
    );

  const removeItem = (id: string) => {
    if (!confirm("정말 삭제할까요?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const openModal = () => {
    resetForm();
    setMode("create");
    setEditingId(null);
    setOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setMode("edit");
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price);
    setPreviewUrl(item.image || "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const onPickFile = (file?: File | null) => {
    if (!file) return;
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onSubmit = () => {
    if (!name.trim()) {
      alert("메뉴 이름을 입력해주세요!");
      return;
    }
    if (price === "" || Number.isNaN(Number(price)) || Number(price) <= 0) {
      alert("가격을 올바르게 입력해주세요!");
      return;
    }

    if (mode === "create") {
      const newItem: MenuItem = {
        id: nextId,
        name: name.trim(),
        price: Number(price),
        image: previewUrl,
        isActive: true,
        isSoldOut: false,
      };
      setItems((prev) => [newItem, ...prev]);
    } else {
      if (!editingId) return;
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingId
            ? {
                ...it,
                name: name.trim(),
                price: Number(price),
                image: previewUrl,
              }
            : it
        )
      );
    }

    setOpen(false);
    resetForm();
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-2 text-sm text-gray-500">로딩 중...</div>
          <div className="text-xs text-gray-400">메뉴 데이터를 불러오고 있습니다</div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-2 text-sm text-red-500">{error}</div>
          <div className="text-xs text-gray-400">
            서버가 실행 중인지 확인해주세요
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 상단 액션 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">총 {items.length}개</div>
        <Button variant="default" size="sm" onClick={openModal}>
          + 메뉴 등록
        </Button>
      </div>

      {/* 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => (
          <Card key={it.id} className={!it.isActive ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-100">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    이미지
                  </div>
                )}

                {it.isSoldOut && (
                  <span className="absolute right-2 top-2 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white">
                    품절
                  </span>
                )}
              </div>

              <div className="mb-1 font-semibold">{it.name}</div>
              {it.categoryName && (
                <div className="mb-1 text-xs text-gray-500">{it.categoryName}</div>
              )}
              <div className="mb-3 text-lg font-bold">
                ₩{it.price.toLocaleString()}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
                  <span className="text-sm text-gray-600">
                    {it.isActive ? "활성화" : "비활성화"}
                  </span>
                  <Button
                    variant={it.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleActive(it.id)}
                  >
                    {it.isActive ? "비활성화" : "활성화"}
                  </Button>
                </div>

                <Button
                  variant={it.isSoldOut ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => toggleSoldOut(it.id)}
                >
                  {it.isSoldOut ? "판매 재개" : "품절 처리"}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(it)}>
                    수정
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(it.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          <div>표시할 메뉴가 없습니다.</div>
          <div className="mt-1 text-xs text-gray-400">
            백엔드 DB에 메뉴 데이터가 있는지 확인해주세요
          </div>
        </div>
      )}

      {/* 등록 모달 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <div className="text-lg font-bold">메뉴 등록</div>
                <div className="mt-1 text-sm text-gray-500">
                  이미지/이름/가격을 입력하세요.
                </div>
              </div>
              <Button variant="ghost" onClick={closeModal}>
                닫기
              </Button>
            </div>

            <div className="space-y-4 p-5">
              {/* 이미지 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">메뉴 이미지</div>
                <div className="flex items-center gap-3">
                  <div className="h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        미리보기
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onPickFile(e.target.files?.[0])}
                      className="block w-full text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      지금은 "미리보기용" 저장입니다. (나중에 서버 업로드로 연결)
                    </p>
                  </div>
                </div>
              </div>

              {/* 이름 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">메뉴 이름</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예) 아이스 아메리카노"
                  className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* 가격 */}
              <div className="space-y-2">
                <div className="text-sm font-medium">가격</div>
                <input
                  value={price}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPrice(v === "" ? "" : Number(v));
                  }}
                  type="number"
                  min={0}
                  placeholder="예) 4900"
                  className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={closeModal}>
                  취소
                </Button>
                <Button variant="default" onClick={onSubmit}>
                  등록
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};