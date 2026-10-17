import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { addDocMock, collectionMock, getDocsMock, queryMock, whereMock } = vi.hoisted(() => ({
  addDocMock: vi.fn(),
  collectionMock: vi.fn(),
  getDocsMock: vi.fn(),
  queryMock: vi.fn(),
  whereMock: vi.fn(),
}));

vi.mock("@/mansa/services/firebase", () => ({
  db: { name: "test-db" },
  addDoc: addDocMock,
  collection: collectionMock,
  getDocs: getDocsMock,
  query: queryMock,
  where: whereMock,
}));

import { ResolutionCenterPanel } from "@/mansa/components/common/ResolutionCenterPanel";

describe("ResolutionCenterPanel", () => {
  beforeEach(() => {
    localStorage.clear();
    addDocMock.mockReset().mockResolvedValue({ id: "firestore-resolution-1" });
    collectionMock.mockReset().mockImplementation((_db, name) => ({ name }));
    getDocsMock.mockReset().mockResolvedValue({ forEach: vi.fn() });
    queryMock.mockReset().mockImplementation((...args) => args);
    whereMock.mockReset().mockImplementation((...args) => args);
  });

  it("persists the reported transaction context and confirms only after Firestore accepts it", async () => {
    render(
      <ResolutionCenterPanel
        userId="customer-42"
        customerName="Aïssata Diop"
        customerEmail="aissata@example.com"
      />,
    );

    fireEvent.change(screen.getByLabelText("Sujet du dossier"), {
      target: { value: "Paiement débité, accès absent" },
    });
    fireEvent.change(screen.getByLabelText("Description du problème"), {
      target: { value: "Le paiement semble confirmé mais je ne vois pas la formation." },
    });
    fireEvent.change(screen.getByLabelText("Entreprise"), { target: { value: "Atelier Exemple" } });
    fireEvent.change(screen.getByLabelText("Offre concernée"), {
      target: { value: "Formation Pro" },
    });
    fireEvent.change(screen.getByLabelText("ID de transaction interne"), {
      target: { value: "TX-2048" },
    });
    fireEvent.change(screen.getByLabelText("Référence du prestataire"), {
      target: { value: "WAVE-REF-890" },
    });
    fireEvent.change(screen.getByLabelText("ID du reçu ou de la commande"), {
      target: { value: "CMD-9301" },
    });
    fireEvent.change(screen.getByLabelText("Prestataire de paiement"), {
      target: { value: "Wave" },
    });
    fireEvent.change(screen.getByLabelText("Montant indiqué"), { target: { value: "25000" } });
    fireEvent.change(screen.getByLabelText("Pays de la transaction"), {
      target: { value: "Sénégal" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Envoyer le dossier" }));

    await screen.findByText(/transmis à l’équipe de support/);

    expect(addDocMock).toHaveBeenCalledWith(
      { name: "resolutionRequests" },
      expect.objectContaining({
        userId: "customer-42",
        customerName: "Aïssata Diop",
        customerEmail: "aissata@example.com",
        companyName: "Atelier Exemple",
        offerName: "Formation Pro",
        transactionId: "TX-2048",
        providerReference: "WAVE-REF-890",
        receiptId: "CMD-9301",
        paymentProvider: "Wave",
        amount: "25000",
        country: "Sénégal",
        paymentInformationSource: "user_reported",
      }),
    );
    expect(screen.getByText("ID de transaction (déclaré)")).toBeInTheDocument();
    expect(screen.getByText("TX-2048")).toBeInTheDocument();
    expect(screen.getByText(/ne confirment pas à eux seuls/)).toBeInTheDocument();

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("mansa_resolution_customer-42") || "[]");
      expect(saved[0]).toEqual(expect.objectContaining({ transactionId: "TX-2048" }));
    });
  });

  it("does not display a success message when the Firestore write fails", async () => {
    addDocMock.mockRejectedValueOnce(new Error("permission denied"));

    render(<ResolutionCenterPanel userId="customer-42" />);
    fireEvent.change(screen.getByLabelText("Sujet du dossier"), {
      target: { value: "Paiement en attente" },
    });
    fireEvent.change(screen.getByLabelText("Description du problème"), {
      target: { value: "La transaction n’apparaît pas." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer le dossier" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/n’a pas pu être transmise/);
    expect(screen.queryByText(/transmis à l’équipe de support/)).not.toBeInTheDocument();
    expect(localStorage.getItem("mansa_resolution_customer-42")).toBeNull();
  });
});
