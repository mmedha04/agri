"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";

interface Location {
  LocationId: number;
  City: string;
  Country: string;
  Latitude: number;
  Longitude: number;
}

interface GroceryProduct {
  UserId: number;
  ProductId: number;
  ProductName: string;
  LocationId: number;
  TotalProductEC: number | string;
  EstimatedFuelGallons: number;
}

interface GroceryList {
  glId: number;
  name: string;
}

interface ModalProps {
  product: GroceryProduct | null;
  onClose: () => void;
  onDelete: () => void;
  onMove: (targetGlId: number) => void;
  currentGlId: number | null;
}

const MoveDeleteModal: React.FC<ModalProps> = ({
  product,
  onClose,
  onDelete,
  onMove,
  currentGlId,
}) => {
  const [targetGlId, setTargetGlId] = useState<number>(currentGlId || 1);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          What would you like to do with {product.ProductName}?
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Move to list:
          </label>
          <select
            value={targetGlId}
            onChange={(e) => setTargetGlId(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num} disabled={num === currentGlId}>
                List {num} {num === currentGlId && "(current)"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onMove(targetGlId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Move
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GroceryListPage() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [selectedGlId, setSelectedGlId] = useState<number | null>(null);
  const [manualGlId, setManualGlId] = useState<string>("");
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [locations, setLocations] = useState<Record<number, Location>>({});
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const [productName, setProductName] = useState<string>("");
  const [productId, setProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [hasMounted, setHasMounted] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [modalProduct, setModalProduct] = useState<GroceryProduct | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetchUserProfile();
    initializeNumberedLists();
  }, []);

  useEffect(() => {
    if (selectedGlId !== null) {
      fetchGroceryList(selectedGlId);
      setManualGlId(selectedGlId.toString());
    }
  }, [selectedGlId]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) {
        setFirstName(data.firstName);
        setLastName(data.lastName);
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    }
  };

  const initializeNumberedLists = () => {
    const numberedLists = Array.from({ length: 10 }, (_, i) => ({
      glId: i + 1,
      name: `${i + 1}`,
    }));
    setLists(numberedLists);
    setSelectedGlId(1);
    setManualGlId("1");
  };

  const fetchLocationData = async (locationIds: number[]) => {
    if (locationIds.length === 0) return;

    try {
      const uniqueIds = [...new Set(locationIds)];
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationIds: uniqueIds }),
      });

      const data = await res.json();

      if (data.success && data.locations) {
        const locationMap: Record<number, Location> = {};
        data.locations.forEach((loc: Location) => {
          locationMap[loc.LocationId] = loc;
        });

        setLocations((prevLocations) => ({
          ...prevLocations,
          ...locationMap,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch location data", err);
    }
  };

  const fetchGroceryList = async (glId: number) => {
    try {
      const res = await fetch(`/api/grocerylist?glId=${glId}`);
      const data = await res.json();

      if (data.success && data.products) {
        setProducts(data.products);
        const locationIds = data.products
          .map((p: GroceryProduct) => p.LocationId)
          .filter((id: number) => id);
        fetchLocationData(locationIds);
        setError("");
      } else {
        setProducts([]);
        setError("No products found in this list");
      }
    } catch (err) {
      console.error("Failed to load grocery list", err);
      setError("Failed to load grocery list");
    }
  };

  const handleProductSearch = async (keyword: string) => {
    setError("");
    setProductId(null);
    setSearchResults([]);

    if (keyword.length < 2) return;

    try {
      const res = await fetch("/api/listProd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, city, country }),
      });

      const data = await res.json();
      const products = data.products || [];
      setSearchResults(products);

      if (products.length === 1) {
        const p = products[0];
        setProductName(p.ProductName);
        setProductId(p.ProductId);
        setCity(p.City || city);
        setCountry(p.Country || country);
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Failed to search products", err);
      setError("Failed to search products");
    }
  };

  const addProduct = async () => {
    const targetGlId = manualGlId ? parseInt(manualGlId) : selectedGlId;

    if (!productId || quantity <= 0 || !targetGlId) {
      setError(
        "Please select a product, enter a valid quantity, and specify a list ID."
      );
      return;
    }

    if (!country) {
      setError("Please enter at least a country for the location.");
      return;
    }

    try {
      const payload = {
        productId,
        quantity,
        city,
        country,
        glId: targetGlId,
      };

      const res = await fetch("/api/grocerylist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        if (data.products) {
          setProducts(data.products);
          const locationIds = data.products
            .map((p: GroceryProduct) => p.LocationId)
            .filter((id: number) => id);
          fetchLocationData(locationIds);
        } else {
          fetchGroceryList(targetGlId);
        }

        setProductName("");
        setProductId(null);
        setQuantity(1);
        setCity("");
        setCountry("");
        setSearchResults([]);
        setError("");
        setSelectedGlId(targetGlId);
      } else {
        setError(data.error || "Failed to add product");
      }
    } catch (err) {
      console.error("Failed to add product", err);
      setError("Failed to add product");
    }
  };

  const deleteProduct = async (productId: number) => {
    if (selectedGlId === null) return;
    try {
      const res = await fetch("/api/grocerylist/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glId: selectedGlId, productId }),
      });
      const data: any = await res.json();
      if (data.success) {
        if (data.products) {
          setProducts(data.products);
          const locationIds = data.products
            .map((p: GroceryProduct) => p.LocationId)
            .filter((id: number) => id);
          fetchLocationData(locationIds);
        } else {
          fetchGroceryList(selectedGlId);
        }
      } else {
        setError(data.error || "Failed to delete product.");
      }
    } catch {
      setError("Failed to delete product.");
    }
  };

  // const moveProduct = async (productId: number, targetGlId: number) => {
  //   if (selectedGlId === null || selectedGlId === targetGlId) return;

  //   try {
  //     const res = await fetch("/api/grocerylist/move", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         glId: selectedGlId,
  //         targetGlId,
  //         productId,
  //       }),
  //     });

  //     const data = await res.json();

  //     if (data.success) {
  //       if (data.products) {
  //         setProducts(data.products);
  //       } else {
  //         fetchGroceryList(selectedGlId);
  //       }
  //     } else {
  //       setError(data.error || "Failed to move product");
  //     }
  //   } catch (err) {
  //     console.error("Failed to move product", err);
  //     setError("Failed to move product");
  //   }
  // };

  const moveProduct = async (productId: number, targetGlId: number) => {
    if (selectedGlId === null || selectedGlId === targetGlId) return;
  
    try {
      const res = await fetch("/api/grocerylist/moveProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceListId: selectedGlId,
          targetListId: targetGlId,
          productId: productId
        }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        if (data.products) {
          setProducts(data.products);
        } else {
          fetchGroceryList(selectedGlId);
        }
      } else {
        setError(data.error || "Failed to move product");
      }
    } catch (err) {
      console.error("Failed to move product", err);
      setError("Failed to move product");
    }
  };

  const deleteGroceryList = async () => {
    if (selectedGlId === null) return;

    try {
      const res = await fetch("/api/grocerylist/deleteAll", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glId: selectedGlId }),
      });

      const data = await res.json();

      if (data.success) {
        setProducts([]);
        setError("");
      } else {
        setError(data.error || "Failed to delete list");
      }
    } catch (err) {
      console.error("Failed to delete list", err);
      setError("Failed to delete list");
    }
  };

  // Duplicate the selected grocery list as a new list
  const duplicateGroceryList = async () => {
    if (selectedGlId === null) return;
    try {
      const res = await fetch("/api/grocerylist/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glId: selectedGlId }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the lists and select the new list (assume max glId is the new one)
        await initializeNumberedLists();
        // Optionally, select the new list if you want:
        // const maxId = lists.length > 0 ? Math.max(...lists.map(l => l.glId)) : null;
        // if (maxId !== null) setSelectedGlId(maxId);
        setError("");
      } else {
        setError(data.error || "Failed to duplicate list");
      }
    } catch (err) {
      console.error("Failed to duplicate list", err);
      setError("Failed to duplicate list");
    }
  };

  const handleManualGlIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualGlId(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      setSelectedGlId(numValue);
    }
  };

  const getLocationDisplay = (locationId: number) => {
    const location = locations[locationId];
    if (!location) return "Loading...";

    return `${
      location.City && location.City.length > 0 ? `${location.City}, ` : ""
    }${location.Country || "Unknown Country"}`;
  };

  const totalEmissions = products.reduce(
    (sum, p) =>
      sum +
      (typeof p.TotalProductEC === "string"
        ? parseFloat(p.TotalProductEC)
        : p.TotalProductEC || 0),
    0
  );

  const totalFuelUsage = products.reduce(
    (sum, p) => sum + (p.EstimatedFuelGallons || 0),
    0
  );

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-black">
      <Navbar />
      <main className="p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          <div className="flex justify-between items-center w-full">
            <h2 className="text-3xl font-bold text-blue-900">
              {firstName} {lastName}&apos;s Grocery Lists
            </h2>
            <div className="flex gap-4">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={selectedGlId ?? ""}
                onChange={(e) => setSelectedGlId(Number(e.target.value))}
              >
                {lists.map((l) => (
                  <option key={l.glId} value={l.glId}>
                    List {l.name}
                  </option>
                ))}
              </select>
              {products.length > 0 && (
                  <>
                  <button
                    onClick={deleteGroceryList}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Clear List
                  </button>
                  <button
                    onClick={duplicateGroceryList}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Duplicate List
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="my-4 w-full flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grocery List ID (1-10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                placeholder="Enter list ID"
                value={manualGlId}
                onChange={handleManualGlIdChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={productName}
                onChange={(e) => {
                  setProductName(e.target.value);
                  handleProductSearch(e.target.value);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchResults.length > 0 && (
                <ul className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {searchResults.map((prod) => (
                    <li
                      key={`${prod.ProductId}-${prod.LocationId}`}
                      onClick={() => {
                        setProductName(prod.ProductName);
                        setProductId(prod.ProductId);
                        setCity(prod.City || city);
                        setCountry(prod.Country || country);
                        setSearchResults([]);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      {prod.ProductName} — {prod.City || "Any City"},{" "}
                      {prod.Country || "Any Country"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City (optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country (required)
                </label>
                <input
                  type="text"
                  placeholder="Enter country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={addProduct}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all"
            >
              Add Product
            </button>
          </div>

          <div className="bg-white w-full rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              Grocery List {selectedGlId !== null ? selectedGlId : ""}
            </h3>
            {products.length > 0 ? (
              <table className="w-full text-left text-gray-800">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Emissions (kg CO₂)</th>
                    <th className="pb-3 font-semibold">Fuel (gal)</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4">{product.ProductName}</td>
                      <td className="py-4">{getLocationDisplay(product.LocationId)}</td>
                      <td className="py-4">
                        {typeof product.TotalProductEC === "string"
                          ? parseFloat(product.TotalProductEC).toFixed(2)
                          : product.TotalProductEC.toFixed(2)}
                      </td>
                      <td className="py-4">
                        {product.EstimatedFuelGallons.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => {
                            setModalProduct(product);
                            setShowModal(true);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                        >
                          Actions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 text-center py-10">
                No products added yet.
              </p>
            )}
            {products.length > 0 && (
              <div className="mt-6 flex justify-end gap-8 text-xl font-bold text-blue-900">
                <div>Total Emissions: {totalEmissions.toFixed(2)} kg CO₂</div>
                <div>Total Fuel Usage: {totalFuelUsage.toFixed(2)} gallons</div>
              </div>
            )}
          </div>
        </div>

        {showModal && modalProduct && (
          <MoveDeleteModal
            product={modalProduct}
            onClose={() => setShowModal(false)}
            onDelete={() => {
              deleteProduct(modalProduct.ProductId);
              setShowModal(false);
            }}
            onMove={(targetGlId) => {
              moveProduct(modalProduct.ProductId, targetGlId);
              setShowModal(false);
            }}
            currentGlId={selectedGlId}
          />
        )}
      </main>
    </div>
  );
}
